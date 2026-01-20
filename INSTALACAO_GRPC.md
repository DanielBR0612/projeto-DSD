# 🚀 Guia Rápido - Instalação e Teste do gRPC

## ⚡ Instalação Rápida com Docker

### 1️⃣ Iniciar todos os serviços

```bash
# No diretório raiz do projeto
docker-compose up --build
```

Aguarde todos os serviços iniciarem:
- ✅ PostgreSQL (porta 5433)
- ✅ RabbitMQ (porta 5672)
- ✅ Banco SOAP - Java (porta 8081)
- ✅ Banco REST - Kotlin (porta 8082)
- ✅ WebSocket Service (porta 8083)
- ✅ API Gateway - TypeScript (porta 8000)
- ✅ **Comprovantes Service - Python gRPC** (porta 50051) 🆕

### 2️⃣ Instalar dependências do Gateway (se necessário)

```bash
cd BancoApiGateway/api-gateway
npm install
```

### 3️⃣ Abrir o Frontend

Abra o arquivo `BancoCliente/index.html` no navegador ou use Live Server.

---

## 🧪 Testando a Comunicação gRPC

### Teste 1: Via Frontend (Recomendado)

1. **Faça Login**
   - Usuário: `190612`
   - Senha: `senha123`

2. **Realize uma Transferência PIX**
   - Conta Origem: `190612`
   - Chave Destino: `190612` (ou outra chave criada)
   - Valor: `100.50`
   - Clique em **"Transferir via PIX"**

3. **Gere o Comprovante**
   - Após a confirmação da transação
   - Clique no botão **"📄 Gerar Comprovante PDF"**
   - O PDF será baixado automaticamente

4. **Teste também com TED**
   - Conta Origem: `190612`
   - Conta Destino: `123456`
   - Valor: `50.00`
   - Clique em **"Transferir via TED"**
   - Clique em **"📄 Gerar Comprovante PDF"**

### Teste 2: Via Swagger (API Gateway)

1. Acesse: `http://localhost:8000/api`

2. Localize o endpoint: `POST /comprovantes/gerar`

3. Envie o seguinte JSON:
```json
{
  "tipo_transacao": "PIX",
  "conta_origem": "123456",
  "conta_destino": "usuario@email.com",
  "valor": 150.75,
  "data_hora": "2026-01-20T15:30:00Z",
  "id_transacao": "PIX_1234567890"
}
```

4. O PDF será retornado como download

### Teste 3: Via cURL

```bash
curl -X POST http://localhost:8000/comprovantes/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_transacao": "TED",
    "conta_origem": "190612",
    "conta_destino": "987654",
    "valor": 250.00,
    "data_hora": "2026-01-20T16:45:00Z",
    "id_transacao": "TED_9876543210"
  }' \
  --output comprovante_teste.pdf

# Abra o PDF gerado
xdg-open comprovante_teste.pdf  # Linux
# ou
open comprovante_teste.pdf      # macOS
```

---

## 📊 Verificando os Logs gRPC

### Logs do Servidor Python (gRPC Server):

```bash
docker logs -f container_comprovantes
```

Você deve ver:
```
🚀 Servidor gRPC de Comprovantes iniciado na porta 50051
📄 Aguardando requisições de geração de comprovantes...
📄 Recebendo requisição para gerar comprovante PIX
   Origem: 123456, Destino: usuario@email.com, Valor: R$ 150.75
✅ Comprovante gerado com sucesso: comprovante_pix_20260120_153000.pdf (45678 bytes)
```

### Logs do Cliente gRPC (API Gateway):

```bash
docker logs -f container_gateway
```

Você deve ver:
```
✅ Cliente gRPC conectado ao servidor: comprovantes-service:50051
📄 Solicitando geração de comprovante PIX via gRPC
✅ Comprovante gerado com sucesso: comprovante_pix_20260120_153000.pdf
✅ Comprovante enviado: comprovante_pix_20260120_153000.pdf
```

---

## 🔍 Verificação de Conectividade gRPC

### Verificar se o serviço Python está rodando:

```bash
docker ps | grep comprovantes
```

Saída esperada:
```
container_comprovantes   Up   0.0.0.0:50051->50051/tcp
```

### Testar conectividade gRPC (dentro do container do Gateway):

```bash
docker exec -it container_gateway sh
nc -zv comprovantes-service 50051
```

Saída esperada:
```
comprovantes-service (172.x.x.x:50051) open
```

---

## 🐛 Troubleshooting

### Erro: "Cliente gRPC não inicializado"

**Solução:**
```bash
docker-compose restart gateway
docker logs -f container_gateway
```

### Erro: "Connection refused on port 50051"

**Solução:**
```bash
# Verificar se o serviço Python está rodando
docker ps | grep comprovantes

# Reiniciar o serviço
docker-compose restart comprovantes-service

# Verificar logs
docker logs container_comprovantes
```

### Erro: "Module comprovante_pb2 not found" (Python)

**Solução:** O Dockerfile já gera os stubs automaticamente, mas se necessário:
```bash
docker exec -it container_comprovantes sh
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. comprovante.proto
```

### PDF não está sendo baixado

**Solução:**
1. Verifique o console do navegador (F12) para erros
2. Teste via Swagger ou cURL primeiro
3. Verifique se o botão só aparece após realizar a transação

---

## 📁 Estrutura do PDF Gerado

O comprovante PDF contém:

```
┌──────────────────────────────────────┐
│     COMPROVANTE DE TRANSAÇÃO         │
│     Banco DSD - Sistema Distribuído  │
├──────────────────────────────────────┤
│                                      │
│  [PIX]  ou  [TED]                   │
│                                      │
│  Dados da Transação                  │
│  ─────────────────────────────       │
│  ID da Transação: PIX_1234567890    │
│  Data e Hora: 20/01/2026 às 15:30   │
│  Conta Origem: 123456                │
│  Chave PIX: usuario@email.com        │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  VALOR DA TRANSAÇÃO          │   │
│  │  R$ 150,75                   │   │
│  └──────────────────────────────┘   │
│                                      │
│  Este comprovante possui validade    │
│  jurídica e pode ser usado como      │
│  prova da transação.                 │
│                                      │
│  Gerado em 20/01/2026 às 15:30:45   │
│  Banco DSD | Sistema Distribuído     │
│                                      │
│  [Marca d'água: BANCO DSD]          │
└──────────────────────────────────────┘
```

---

## ✅ Checklist de Verificação

- [ ] Todos os containers estão rodando (`docker ps`)
- [ ] Servidor gRPC Python iniciado (porta 50051)
- [ ] API Gateway conectado ao gRPC
- [ ] Frontend carregado corretamente
- [ ] Consegue fazer login
- [ ] Consegue realizar transação PIX
- [ ] Consegue realizar transação TED
- [ ] Botão "Gerar Comprovante" aparece após transação
- [ ] PDF é baixado corretamente
- [ ] PDF contém todos os dados da transação

---

## 📚 Documentação Adicional

- **[README.md](README.md)** - Documentação geral do projeto
- **[GRPC_IMPLEMENTATION.md](GRPC_IMPLEMENTATION.md)** - Detalhes da implementação gRPC
- **[ARQUITETURA_GRPC.md](ARQUITETURA_GRPC.md)** - Diagramas e fluxos

---

## 🎯 Demonstrando o Requisito

Este projeto demonstra:

✅ **Transmissão de dados com gRPC**
- Comunicação cliente-servidor via Protocol Buffers
- Transferência eficiente de dados binários (PDF)

✅ **Duas linguagens diferentes**
- **Python** (Servidor gRPC - Geração de PDF)
- **TypeScript/Node.js** (Cliente gRPC - API Gateway)

✅ **Arquitetura empregada**
- Diagramas completos em `ARQUITETURA_GRPC.md`
- Separação de responsabilidades
- Microsserviços independentes

---

**Desenvolvido por**: Daniel Braga & Josephy Cruz Araújo  
**Instituição**: IFRN  
**Disciplina**: Desenvolvimento de Sistemas Distribuídos  
**Data**: Janeiro 2026
