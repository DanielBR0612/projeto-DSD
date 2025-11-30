import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.send("Olá do WebSocket!");

  ws.on("message", (msg) => {
    console.log("Mensagem:", msg.toString());
    ws.send("Eco: " + msg.toString());
  });
});
