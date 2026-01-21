# Serviço de Geração de Comprovantes - gRPC

Este serviço é responsável por gerar comprovantes de transações bancárias (PIX e TED) em formato PDF usando gRPC.

## 🎯 Propósito

Demonstrar comunicação gRPC entre dois serviços em **linguagens diferentes**:
- **Servidor**: Python (geração de PDF)
- **Cliente**: TypeScript/Node.js (API Gateway)

## 🏗️ Arquitetura

```
┌─────────────────┐         gRPC          ┌──────────────────────┐
│   API Gateway   │ ─────────────────────> │  Comprovantes Srv   │
│  (TypeScript)   │   (Protocol Buffers)   │      (Python)        │
└─────────────────┘ <───────────────────── └──────────────────────┘
        │                                              │
        │                                              │
        v                                              v
   REST API                                     Gera PDF
  (Frontend)                                  (ReportLab)
```

## 📋 Funcionalidades

- ✅ Recebe dados da transação via gRPC
- ✅ Gera comprovante em PDF com design profissional
- ✅ Inclui: data, valor, tipo, contas origem/destino
- ✅ Retorna PDF em bytes para download

## 🚀 Como usar

### Localmente

1. Instalar dependências:
```bash
pip install -r requirements.txt
```

2. Gerar os stubs Python a partir do .proto:
```bash
python -m grpc_tools.protoc \
    -I. \
    --python_out=. \
    --grpc_python_out=. \
    comprovante.proto
```

3. Executar o servidor:
```bash
python server.py
```

### Com Docker

```bash
docker build -t comprovantes-service .
docker run -p 50051:50051 comprovantes-service
```

## 🔌 Interface gRPC

Ver [comprovante.proto](comprovante.proto) para a definição completa.

### Exemplo de requisição:

```protobuf
{
  tipo_transacao: "PIX"
  conta_origem: "123456"
  conta_destino: "usuario@email.com"
  valor: 100.50
  data_hora: "2026-01-20T14:30:00Z"
  id_transacao: "txn_abc123"
}
```

### Exemplo de resposta:

```protobuf
{
  pdf_data: <bytes do PDF>
  filename: "comprovante_pix_20260120_143000.pdf"
  success: true
  message: "Comprovante gerado com sucesso"
}
```

## 📦 Dependências

- `grpcio`: Biblioteca gRPC para Python
- `grpcio-tools`: Ferramentas para compilar .proto
- `reportlab`: Geração de PDF

## 🔐 Porta

Servidor escuta na porta: **50051**
