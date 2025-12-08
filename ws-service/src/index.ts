import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors'; 
import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({ origin: '*' })); 
app.use(express.json()); 

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

type ClientId = string;
const clients = new Map<ClientId, WebSocket>();

//Setup RabbitMQ
let channel: amqp.Channel;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const NOTIFICATION_QUEUE = process.env.RABBITMQ_NOTIFICATION_QUEUE || 'notificacoes.transferencias';
const DEAD_LETTER_QUEUE = 'notificacoes.transferencias.dlq'; // Dead Letter Queue

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Configura a fila principal com Dead Letter Exchange
    await channel.assertExchange('notificacoes.dlx', 'direct', { durable: true });
    await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(DEAD_LETTER_QUEUE, 'notificacoes.dlx', DEAD_LETTER_QUEUE);

    // Fila principal com TTL e Dead Letter
    await channel.assertQueue(NOTIFICATION_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'notificacoes.dlx',
        'x-dead-letter-routing-key': DEAD_LETTER_QUEUE,
        'x-message-ttl': 86400000, // 24 horas em ms
      },
    });

    console.log('[RabbitMQ] Conectado e filas configuradas');

    // Inicia consumo de mensagens
    consumeNotifications();

    connection.on('error', (err) => {
      console.error('[RabbitMQ] Erro de conexão:', err);
      setTimeout(() => connectRabbitMQ(), 5000); // Reconectar
    });
  } catch (error) {
    console.error('[RabbitMQ] Falha ao conectar:', error);
    setTimeout(() => connectRabbitMQ(), 5000);
  }
}

async function consumeNotifications() {
  if (!channel) return;

  await channel.consume(NOTIFICATION_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const notification = JSON.parse(msg.content.toString());
      const { destinatarioId, valor, tipo, timestamp } = notification;

      console.log(`[Queue] Processando notificação para ${destinatarioId}`);

      const ws = clients.get(destinatarioId);

      if (ws && ws.readyState === WebSocket.OPEN) {
        // Cliente online - envia imediatamente
        ws.send(
          JSON.stringify({
            event: 'nova-transacao',
            data: { destinatarioId, valor, tipo, timestamp },
          }),
        );
        console.log(`[WS] Notificação entregue ao cliente ${destinatarioId}`);
        channel.ack(msg); // Remove da fila
      } else {
        // Cliente offline - rejeita para reprocessar depois
        console.log(`[WS] Cliente ${destinatarioId} offline - mantendo na fila`);
        channel.nack(msg, false, true); // Requeue = true
      }
    } catch (error) {
      console.error('[Queue] Erro ao processar mensagem:', error);
      channel.nack(msg, false, false); // Move para DLQ
    }
  });
}

//HTTP Endpoints
app.post('/notify', async (req: Request, res: Response) => {
  const { destinatarioId, valor, tipo } = req.body;
  
  if (!destinatarioId || !valor || !tipo) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    // Publica mensagem na fila
    const notification = {
      destinatarioId,
      valor,
      tipo,
      timestamp: new Date().toISOString(),
    };

    channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(notification)), {
      persistent: true, // Persiste em disco
      contentType: 'application/json',
    });

    console.log(`[NOTIFY] Notificação enfileirada para ${destinatarioId}`);
    res.status(200).json({ ok: true, message: 'Notificação enfileirada' });
  } catch (error) {
    console.error('[NOTIFY] Erro ao enfileirar:', error);
    res.status(500).json({ error: 'Falha ao enfileirar notificação' });
  }
});

// Endpoint auxiliar para reprocessar DLQ (uso manual)
app.post('/admin/reprocess-dlq', async (req: Request, res: Response) => {
  try {
    const messages = await channel.get(DEAD_LETTER_QUEUE);
    if (messages) {
      await channel.sendToQueue(NOTIFICATION_QUEUE, messages.content, { persistent: true });
      channel.ack(messages);
      console.log('[Admin] Mensagem movida de DLQ para fila principal');
      res.json({ success: true });
    } else {
      res.json({ message: 'DLQ vazia' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reprocessar' });
  }
});

// Ciclo de vida do WebSocket
wss.on('connection', (socket, request) => {
  console.log('[WS] Nova tentativa de conexão...');

  const url = new URL(request.url ?? '', 'http://localhost');
  const token = url.searchParams.get('token');
  
  const secret = process.env.WS_JWT_SECRET || 'secret';

  let clienteId: string | null = null;

  if (!token) {
    socket.close(1008, 'Token Obrigatório');
    return;
  }

  try {
    // Valida o Token gerado pelo seu Gateway
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    
    // Pega o ID da conta do payload (campo 'sub')
    clienteId = payload.sub as string;
    
    if (!clienteId) {
       socket.close(1008, 'Token sem ID de conta (sub)');
       return;
    }
    
    console.log(`[WS] Cliente Autenticado: ${clienteId}`);
    clients.set(clienteId, socket);
    socket.send(JSON.stringify({ event: 'info', message: 'Conectado com sucesso!' }));

    socket.on('close', () => {
      console.log(`[WS] Cliente ${clienteId} desconectou`);
      clients.delete(clienteId as string);
    });

  } catch (err) {
    console.error('JWT inválido:', (err as Error).message);
    socket.close(1008, 'Token Inválido');
    return;
  }
});

//Inialização 
const PORT = Number(process.env.PORT || 8083);

connectRabbitMQ().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serviço de Notificações rodando na porta ${PORT}`);
    console.log(`HTTP POST: http://localhost:${PORT}/notify`);
    console.log(`WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`RabbitMQ Queue: ${NOTIFICATION_QUEUE}`);
    console.log(`Dead Letter Queue: ${DEAD_LETTER_QUEUE}`);
  });
});