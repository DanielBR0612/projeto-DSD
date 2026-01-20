# Implementação gRPC - Geração de Comprovantes

## 📖 Visão Geral

Este documento descreve a implementação de comunicação gRPC entre dois serviços em **linguagens diferentes** para geração de comprovantes de transações bancárias em PDF.

## 🎯 Objetivo

Demonstrar transmissão de dados com gRPC entre:
- **Servidor Python**: Responsável por gerar PDFs de comprovantes
- **Cliente TypeScript/Node.js**: API Gateway que solicita a geração

## 🏗️ Arquitetura

```
┌──────────────┐         REST          ┌─────────────────┐
│   Frontend   │ ──────────────────────>│   API Gateway   │
│  (HTML/JS)   │                        │  (TypeScript)   │
└──────────────┘                        └────────┬────────┘
                                                 │
                                                 │ gRPC
                                                 │ (Protocol Buffers)
                                                 │
                                                 v
                                        ┌────────────────────┐
                                        │  Comprovantes Srv  │
                                        │     (Python)       │
                                        │  - ReportLab PDF   │
                                        └────────────────────┘
```

## 📋 Componentes

### 1. Protocol Buffers Definition (`.proto`)

**Arquivo**: `ComprovantesService/comprovante.proto`

Define a interface gRPC:
- **Serviço**: `ComprovanteService`
- **Método**: `GerarComprovante`
- **Mensagens**: 
  - `ComprovanteRequest` (entrada)
  - `ComprovanteResponse` (saída com PDF em bytes)

```protobuf
service ComprovanteService {
  rpc GerarComprovante (ComprovanteRequest) returns (ComprovanteResponse);
}
```

### 2. Servidor gRPC (Python)

**Arquivo**: `ComprovantesService/server.py`

- **Porta**: 50051
- **Biblioteca PDF**: ReportLab
- **Funcionalidades**:
  - Recebe requisição gRPC com dados da transação
  - Gera PDF com design profissional
  - Retorna bytes do PDF via gRPC

**Tecnologias**:
- `grpcio`: Framework gRPC para Python
- `reportlab`: Geração de PDF

### 3. Cliente gRPC (TypeScript)

**Arquivo**: `BancoApiGateway/api-gateway/src/comprovantes-grpc/comprovantes-grpc.service.ts`

- **Framework**: NestJS
- **Bibliotecas gRPC**:
  - `@grpc/grpc-js`: Cliente gRPC para Node.js
  - `@grpc/proto-loader`: Carregamento dinâmico de .proto
- **Funcionalidade**: 
  - Conecta-se ao servidor Python
  - Envia dados da transação
  - Recebe PDF gerado

### 4. Endpoint REST (API Gateway)

**Arquivo**: `BancoApiGateway/api-gateway/src/comprovantes/comprovantes.controller.ts`

- **Rota**: `POST /comprovantes/gerar`
- **Função**: 
  - Recebe requisição REST do frontend
  - Chama o serviço gRPC
  - Retorna PDF como download

### 5. Interface Frontend

**Arquivos**: 
- `BancoCliente/index.html`
- `BancoCliente/script.js`

- **Funcionalidade**: 
  - Botão "📄 Gerar Comprovante PDF" nos cards de PIX e TED
  - Envia requisição para `/comprovantes/gerar`
  - Faz download automático do PDF

## 🔄 Fluxo de Dados

1. **Usuário** realiza uma transação (PIX ou TED)
2. **Frontend** armazena os dados da transação
3. **Usuário** clica em "Gerar Comprovante"
4. **Frontend** → API Gateway (REST): `POST /comprovantes/gerar`
5. **API Gateway** → Serviço Python (gRPC): `GerarComprovante()`
6. **Serviço Python** gera o PDF usando ReportLab
7. **Serviço Python** → API Gateway (gRPC): Retorna bytes do PDF
8. **API Gateway** → Frontend (HTTP): Retorna PDF como arquivo
9. **Frontend** faz download automático do PDF

## 📊 Estrutura do Comprovante PDF

O PDF gerado contém:
- ✅ Cabeçalho com logo do banco
- ✅ Badge do tipo de transação (PIX ou TED)
- ✅ ID da transação
- ✅ Data e hora formatada
- ✅ Conta de origem
- ✅ Conta de destino / Chave PIX
- ✅ Valor destacado em grande fonte
- ✅ Marca d'água "BANCO DSD"
- ✅ Rodapé com informações legais

## 🚀 Como Executar

### 1. Com Docker Compose (Recomendado)

```bash
# Builda e inicia todos os serviços
docker-compose up --build

# Acessa o frontend
# http://localhost:5500 ou porta do Live Server
```

### 2. Execução Local (Desenvolvimento)

#### Serviço Python (gRPC Server):

```bash
cd ComprovantesService
pip install -r requirements.txt
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. comprovante.proto
python server.py
```

#### API Gateway (gRPC Client):

```bash
cd BancoApiGateway/api-gateway
npm install
npm run start:dev
```

## 🧪 Testando a Comunicação gRPC

### Via Frontend:
1. Acesse o frontend
2. Realize uma transferência PIX ou TED
3. Clique no botão "📄 Gerar Comprovante PDF"
4. O PDF será baixado automaticamente

### Via Swagger (API Gateway):
1. Acesse: `http://localhost:8000/api`
2. Endpoint: `POST /comprovantes/gerar`
3. Body:
```json
{
  "tipo_transacao": "PIX",
  "conta_origem": "123456",
  "conta_destino": "usuario@email.com",
  "valor": 100.50,
  "data_hora": "2026-01-20T14:30:00Z",
  "id_transacao": "txn_abc123"
}
```

### Via cURL:
```bash
curl -X POST http://localhost:8000/comprovantes/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_transacao": "PIX",
    "conta_origem": "123456",
    "conta_destino": "usuario@email.com",
    "valor": 100.50,
    "data_hora": "2026-01-20T14:30:00Z",
    "id_transacao": "txn_abc123"
  }' \
  --output comprovante.pdf
```

## 🔍 Verificação da Comunicação gRPC

### Logs do Servidor Python:
```
🚀 Servidor gRPC de Comprovantes iniciado na porta 50051
📄 Aguardando requisições de geração de comprovantes...
📄 Recebendo requisição para gerar comprovante PIX
   Origem: 123456, Destino: usuario@email.com, Valor: R$ 100.50
✅ Comprovante gerado com sucesso: comprovante_pix_20260120_143000.pdf (45678 bytes)
```

### Logs do API Gateway (TypeScript):
```
✅ Cliente gRPC conectado ao servidor: comprovantes-service:50051
📄 Solicitando geração de comprovante PIX via gRPC
✅ Comprovante gerado com sucesso: comprovante_pix_20260120_143000.pdf
✅ Comprovante enviado: comprovante_pix_20260120_143000.pdf
```

## 📦 Dependências

### Python (Servidor):
- `grpcio==1.60.0`
- `grpcio-tools==1.60.0`
- `reportlab==4.0.9`

### Node.js/TypeScript (Cliente):
- `@grpc/grpc-js@^1.10.1`
- `@grpc/proto-loader@^0.7.12`
- `@nestjs/common@^11.0.1`

## 🎓 Conceitos Demonstrados

### 1. ✅ Transmissão de Dados com gRPC
- Comunicação bidirecional entre serviços
- Serialização eficiente com Protocol Buffers
- Transferência de dados binários (PDF)

### 2. ✅ Duas Linguagens Diferentes
- **Python**: Servidor gRPC (geração de PDF)
- **TypeScript/Node.js**: Cliente gRPC (API Gateway)

### 3. ✅ Arquitetura Distribuída
- Separação de responsabilidades
- Serviço especializado em uma única tarefa
- Escalabilidade independente

## 🔐 Porta Utilizada

- **gRPC**: 50051 (Serviço de Comprovantes)

## 📝 Observações

1. **Eficiência**: gRPC usa HTTP/2 e Protocol Buffers, sendo mais eficiente que REST/JSON
2. **Tipagem**: O .proto define contratos fortemente tipados
3. **Binário**: PDFs são transferidos como bytes, evitando encoding Base64
4. **Escalabilidade**: O serviço Python pode ser escalado independentemente

## 🎯 Atende aos Requisitos

- ✅ **Transmissão com gRPC**: Comunicação entre Gateway e Serviço de Comprovantes
- ✅ **Duas linguagens diferentes**: TypeScript (cliente) e Python (servidor)
- ✅ **Arquitetura demonstrada**: Diagrama e documentação completa

## 🔗 Arquivos Importantes

- `ComprovantesService/comprovante.proto` - Definição Protocol Buffers
- `ComprovantesService/server.py` - Servidor gRPC Python
- `BancoApiGateway/api-gateway/src/comprovantes-grpc/` - Cliente gRPC TypeScript
- `docker-compose.yaml` - Orquestração dos serviços
- `BancoCliente/` - Interface frontend

---

**Desenvolvido por**: Daniel Braga & Josephy Cruz Araújo  
**Disciplina**: Desenvolvimento de Sistemas Distribuídos  
**Data**: Janeiro 2026
