import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors'; 

const app = express();

app.use(cors({ origin: '*' })); 
app.use(express.json()); 

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

type ClientId = string;
const clients = new Map<ClientId, WebSocket>();

app.post('/notify', (req: Request, res: Response) => { 
  const { destinatarioId, valor, tipo } = req.body;
  
  console.log(`[NOTIFY] Recebido para ${destinatarioId}: R$ ${valor}`);

  const ws = clients.get(destinatarioId);
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: 'nova-transacao',
        data: { destinatarioId, valor, tipo, timestamp: new Date().toISOString() },
      }),
    );
    console.log(`[WS] Mensagem enviada para o socket do cliente ${destinatarioId}`);
  } else {
    console.log(`[WS] Cliente ${destinatarioId} offline ou desconectado.`);
  }
  
  res.status(200).json({ ok: true });
});

// Ciclo de vida do WebSocket
wss.on('connection', (socket, request) => {
  console.log('[WS] Nova tentativa de conexão...');

  const url = new URL(request.url ?? '', 'http://localhost');
  const token = url.searchParams.get('token');
  
  // IMPORTANTE: Esse segredo TEM que ser igual ao do Gateway (AuthModule)
  const secret = 'secret'; 

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

  } catch (err) {
    console.error('JWT inválido:', err.message);
    socket.close(1008, 'Token Inválido');
    return;
  }

  // Registra
  clients.set(clienteId, socket);

  socket.send(JSON.stringify({ event: 'info', message: 'Conectado com sucesso!' }));

  socket.on('close', () => {
    console.log(`[WS] Cliente ${clienteId} desconectou.`);
    clients.delete(clienteId as string);
  });
});

const PORT = Number(process.env.PORT || 8083);
server.listen(PORT, '0.0.0.0', () => {
  console.log(` Serviço de Notificações rodando na porta ${PORT}`);
  console.log(`   - HTTP POST: http://localhost:${PORT}/notify`);
  console.log(`   - WebSocket: ws://localhost:${PORT}/ws`);
});