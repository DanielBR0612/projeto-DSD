# 🧪 Guia de Teste Completo - Sistema de Chat Integrado

Este guia mostra como testar todo o sistema de chat com diferentes clientes conectados simultaneamente.

## 📋 Pré-requisitos

1. Docker e Docker Compose instalados
2. Node.js 18+ instalado
3. Python 3.8+ instalado (opcional)
4. Navegador web moderno

## 🚀 Passo 1: Iniciar Todos os Serviços

### Opção A: Usando Docker Compose (Recomendado)

```bash
# No diretório raiz do projeto
docker-compose up -d

# Verificar se todos os serviços estão rodando
docker-compose ps
```

Serviços esperados:
- `api-gateway` (porta 3000)
- `banco-soap` (porta 8080)
- `banco-rest` (porta 8081)
- `ws-service` (porta 8083)
- `rabbitmq` (porta 5672, 15672)

### Opção B: Iniciar Manualmente

```bash
# Terminal 1: API Gateway
cd BancoApiGateway/api-gateway
npm install
npm run start:dev

# Terminal 2: Banco SOAP (opcional se não usar Docker)
cd BancoCoreSOAP
./mvnw spring-boot:run

# Terminal 3: Banco REST (opcional se não usar Docker)
cd BancoRestApi
./mvnw spring-boot:run
```

## 🧪 Passo 2: Testar o Servidor de Chat

```bash
cd BancoApiGateway/api-gateway

# Executar testes automatizados
./test-chat.sh
```

Resultado esperado:
```
🧪 Teste do Sistema de Chat TCP/UDP
====================================

[1/4] Verificando servidor...
✅ Servidor está rodando!

[2/4] Testando conexão TCP...
✅ TCP: Conectado com sucesso!

[3/4] Testando conexão UDP...
✅ UDP: Mensagem JOIN enviada

[4/4] Verificando estatísticas...
✅ Testes concluídos!
```

## 💬 Passo 3: Conectar Múltiplos Clientes

### Cliente 1: Web (REST)

```bash
# Abrir cliente web
cd BancoCliente
python3 -m http.server 5500
```

No navegador:
1. Acesse `http://localhost:5500`
2. Faça login (conta: 190612, senha: 123456)
3. Clique no botão de chat (canto inferior direito)
4. Clique em "Conectar"

### Cliente 2: TCP (Node.js)

```bash
# Novo terminal
cd BancoApiGateway/api-gateway
node tcp-client.js Alice
```

Comandos disponíveis:
```
> Olá do TCP!
> LIST
> HISTORY
```

### Cliente 3: UDP (Node.js)

```bash
# Novo terminal
cd BancoApiGateway/api-gateway
node udp-client.js Bob
```

Comandos disponíveis:
```
> Olá do UDP!
> LIST
> HISTORY
```

### Cliente 4: TCP (Python)

```bash
# Novo terminal
cd BancoApiGateway/api-gateway
python3 tcp-client.py localhost 9000 Charlie
```

### Cliente 5: UDP (Python)

```bash
# Novo terminal
cd BancoApiGateway/api-gateway
python3 udp-client.py localhost 9001 Diana
```

## 🎯 Cenários de Teste

### Teste 1: Comunicação Cross-Protocol

**Objetivo**: Verificar que usuários TCP, UDP e REST conversam entre si.

**Passos**:
1. Conectar Cliente Web (REST)
2. Conectar Cliente TCP (Alice)
3. Conectar Cliente UDP (Bob)
4. Enviar mensagem de cada cliente
5. Verificar se todos recebem as mensagens

**Resultado Esperado**:
```
[Web] ✅ Recebe mensagens de Alice (TCP) e Bob (UDP)
[TCP Alice] ✅ Recebe mensagens do Web e Bob
[UDP Bob] ✅ Recebe mensagens do Web e Alice
```

### Teste 2: Lista de Usuários

**Objetivo**: Verificar lista de usuários online.

**Passos**:
1. Conectar 3-5 clientes de diferentes protocolos
2. No cliente web, clicar em "Usuários"
3. No cliente TCP, digitar `LIST`
4. No cliente UDP, digitar `LIST`

**Resultado Esperado**:
```
👥 Usuários online (5):
  - Conta-190612 (REST)
  - Alice (TCP)
  - Bob (UDP)
  - Charlie (TCP)
  - Diana (UDP)
```

### Teste 3: Histórico de Mensagens

**Objetivo**: Verificar carregamento de histórico.

**Passos**:
1. Com clientes já conectados, enviar 10-20 mensagens
2. Desconectar um cliente
3. Reconectar o mesmo cliente
4. Verificar se histórico é carregado

**Resultado Esperado**:
```
📜 Histórico de mensagens (20):
  [10:30] [TCP] Alice: Mensagem 1
  [10:31] [UDP] Bob: Mensagem 2
  ...
```

### Teste 4: Desconexão e Reconexão

**Objetivo**: Testar robustez de conexões.

**Passos**:
1. Conectar Cliente TCP (Alice)
2. Enviar algumas mensagens
3. Fechar cliente abruptamente (Ctrl+C)
4. Verificar notificação nos outros clientes
5. Reconectar Alice

**Resultado Esperado**:
```
[Sistema] Alice saiu do chat (TCP)
... (depois)
[Sistema] Alice entrou no chat (TCP)
```

### Teste 5: Envio em Massa

**Objetivo**: Testar performance com múltiplas mensagens.

**Passos**:
1. Conectar 3+ clientes
2. Cada cliente envia 10 mensagens rapidamente
3. Verificar se todas chegam para todos

**Resultado Esperado**:
- ✅ Todas as mensagens são entregues
- ✅ Ordem é mantida
- ✅ Sem perda de mensagens

### Teste 6: Latência

**Objetivo**: Medir latência entre protocolos.

**Passos**:
1. Em cada cliente, digitar `PING`
2. Anotar latências

**Resultado Esperado**:
```
TCP:  ~5-10ms
UDP:  ~3-8ms
REST: ~50-100ms (devido ao polling)
```

### Teste 7: Keep-Alive UDP

**Objetivo**: Verificar manutenção de conexão UDP.

**Passos**:
1. Conectar Cliente UDP
2. Não enviar mensagens por 2 minutos
3. Enviar mensagem
4. Verificar se continua conectado

**Resultado Esperado**:
```
✅ Cliente permanece conectado
✅ Mensagem é entregue normalmente
```

### Teste 8: Inatividade UDP

**Objetivo**: Verificar timeout de inatividade.

**Passos**:
1. Conectar Cliente UDP
2. Não enviar mensagens por 6 minutos
3. Verificar desconexão automática

**Resultado Esperado**:
```
[Sistema] Usuario foi desconectado por inatividade
```

### Teste 9: API REST

**Objetivo**: Testar endpoints da API.

**Passos**:

```bash
# Informações do servidor
curl http://localhost:3000/chat/info | jq

# Mensagens recentes
curl http://localhost:3000/chat/messages?limit=10 | jq

# Usuários conectados
curl http://localhost:3000/chat/users | jq

# Estatísticas
curl http://localhost:3000/chat/stats | jq

# Enviar mensagem via API
curl -X POST http://localhost:3000/chat/message \
  -H "Content-Type: application/json" \
  -d '{"username":"API-Test","message":"Olá via API!"}'
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "tcp": {"port": 9000, "clients": 2},
    "udp": {"port": 9001, "clients": 1},
    "totalMessages": 45,
    "totalClients": 3
  }
}
```

### Teste 10: Integração com Sistema Bancário

**Objetivo**: Testar chat integrado ao sistema bancário.

**Passos**:
1. Fazer login no sistema bancário (conta 190612)
2. Abrir chat
3. Realizar transferência bancária
4. Verificar se notificação aparece no chat
5. Conversar com outros usuários sobre transações

**Resultado Esperado**:
```
[Sistema] Transferência realizada: R$ 100,00
[Conta-190612] Acabei de receber uma transferência!
[Alice] Parabéns!
```

## 📊 Monitoramento Durante os Testes

### Terminal 1: Logs do API Gateway

```bash
docker logs -f api-gateway

# ou

cd BancoApiGateway/api-gateway
npm run start:dev
```

Logs esperados:
```
🚀 [TCP] Servidor de chat rodando em 0.0.0.0:9000
🚀 [UDP] Servidor de chat rodando em 0.0.0.0:9001
[TCP] 🔗 Novo cliente conectado: tcp_127.0.0.1:54321
[TCP] ✅ Alice entrou no chat
[TCP] 💬 Alice: Olá!
```

### Terminal 2: Estatísticas em Tempo Real

```bash
# Atualizar a cada 2 segundos
watch -n 2 'curl -s http://localhost:3000/chat/stats | jq'
```

### Terminal 3: Mensagens em Tempo Real

```bash
# Monitorar novas mensagens
watch -n 2 'curl -s http://localhost:3000/chat/messages?limit=5 | jq .data.messages'
```

## ✅ Checklist de Validação

Após os testes, verificar:

- [ ] Servidor TCP aceita conexões na porta 9000
- [ ] Servidor UDP aceita mensagens na porta 9001
- [ ] API REST responde em /chat/*
- [ ] Cliente Web conecta via REST
- [ ] Clientes TCP enviam e recebem mensagens
- [ ] Clientes UDP enviam e recebem mensagens
- [ ] Mensagens cross-protocol funcionam
- [ ] Lista de usuários atualiza corretamente
- [ ] Histórico é carregado ao conectar
- [ ] Desconexões são detectadas e notificadas
- [ ] Keep-alive mantém conexões UDP
- [ ] Timeout remove usuários inativos (UDP)
- [ ] Badge de notificações funciona
- [ ] Interface web é responsiva
- [ ] Logs são gerados corretamente

## 🐛 Problemas Comuns e Soluções

### Erro: "EADDRINUSE: address already in use :::9000"

```bash
# Encontrar processo usando a porta
lsof -i :9000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
# Editar chat.service.ts
```

### Erro: "Cannot connect to server"

```bash
# Verificar se servidor está rodando
curl http://localhost:3000/chat/info

# Verificar firewall
sudo ufw status

# Verificar Docker
docker-compose ps
```

### Mensagens não chegam

1. Verificar logs do servidor
2. Testar com PING
3. Verificar se está conectado
4. Reiniciar cliente

### Badge não atualiza

1. Abrir console do navegador (F12)
2. Verificar erros JavaScript
3. Limpar cache do navegador
4. Recarregar página

## 📈 Métricas de Sucesso

Após executar todos os testes:

| Métrica | Valor Esperado |
|---------|----------------|
| Taxa de entrega de mensagens | > 99% |
| Latência média (TCP) | < 10ms |
| Latência média (UDP) | < 8ms |
| Latência média (REST) | < 100ms |
| Clientes simultâneos suportados | > 10 |
| Mensagens por segundo | > 50 |
| Tempo de reconexão | < 1s |
| Perda de mensagens | 0% |

## 🎓 Conclusão

Após seguir este guia, você terá:

✅ Testado todos os protocolos (TCP, UDP, REST)
✅ Verificado comunicação cross-protocol
✅ Validado robustez do sistema
✅ Monitorado performance
✅ Confirmado integração com sistema bancário

## 📚 Próximos Passos

1. Implementar testes automatizados (Jest, Pytest)
2. Adicionar métricas de performance (Prometheus)
3. Configurar CI/CD
4. Deploy em produção
5. Monitoramento e alertas

---

**Dúvidas?** Consulte:
- [CHAT_README.md](../BancoApiGateway/api-gateway/CHAT_README.md) - Documentação do servidor
- [CHAT_CLIENT_README.md](CHAT_CLIENT_README.md) - Documentação do cliente web
