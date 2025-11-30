import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

type ClientId = string;
const clients = new Map<ClientId, WebSocket>();

// Endpoint HTTP que o API Gateway vai chamar para notificar
app.post('/notify', (req: Request, res: Response) => {
  const { destinatarioId, valor, tipo } = req.body; // tipo: 'PIX' | 'TED'
  const ws = clients.get(destinatarioId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: 'nova-transacao',
        data: { destinatarioId, valor, tipo, timestamp: new Date().toISOString() },
      }),
    );
  }
  res.status(200).json({ ok: true });
});

// Ciclo de vida do WebSocket com autenticação via JWT
wss.on('connection', (socket, request) => {
  // Ex: ws://localhost:4000?clienteId=123&token=eyJ...
  const url = new URL(request.url ?? '', 'http://localhost');
  const token = url.searchParams.get('token');
  const claimedId = url.searchParams.get('clienteId');

  const secret = process.env.WS_JWT_SECRET || 'CHANGE_ME_IN_PROD';

  // validar token
  let clienteId: string | null = null;
  if (!token) {
    // Sem token: recusar conexão
    try { socket.close(1008, 'Unauthorized'); } catch (e) { socket.terminate(); }
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload | string;
    if (typeof payload === 'string') {
      // payload string não esperado
      try { socket.close(1008, 'Unauthorized'); } catch (e) { socket.terminate(); }
      return;
    }

    // Preferir claim 'sub' ou 'clienteId' do token. Se claim ausente, usar o clienteId informado (menos seguro).
    clienteId = (payload.sub as string) ?? (payload.clienteId as string) ?? claimedId ?? null;
    if (!clienteId) {
      try { socket.close(1008, 'Unauthorized'); } catch (e) { socket.terminate(); }
      return;
    }
  } catch (err) {
    console.error('JWT inválido na conexão WS:', err);
    try { socket.close(1008, 'Unauthorized'); } catch (e) { socket.terminate(); }
    return;
  }

  // Registra cliente autenticado
  clients.set(clienteId, socket);

  socket.on('close', () => {
    clients.delete(clienteId as string);
  });

  socket.on('error', () => {
    clients.delete(clienteId as string);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`WS service rodando na porta ${PORT}`);
});