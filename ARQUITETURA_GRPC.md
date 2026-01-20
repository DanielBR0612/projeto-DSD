# Diagrama da Arquitetura gRPC

## Visão Geral do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (HTML/JS)                            │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Card PIX    │  │  Card TED   │  │  Extrato    │  │  Login/Auth  │ │
│  │  + Botão    │  │  + Botão    │  │             │  │              │ │
│  │ Comprovante │  │ Comprovante │  │             │  │              │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘ │
│                                                                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │ HTTP REST
                                │ POST /comprovantes/gerar
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                     API GATEWAY (TypeScript/NestJS)                     │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ SOAP Client  │  │ REST Client  │  │  gRPC Client                 │ │
│  │  (Java)      │  │  (Kotlin)    │  │  (Python - Comprovantes)     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────────┘ │
│         │                 │                      │                     │
└─────────┼─────────────────┼──────────────────────┼───────────────────────┘
          │                 │                      │
          │ SOAP            │ REST                 │ gRPC
          │ (XML)           │ (JSON)               │ (Protocol Buffers)
          │                 │                      │
┌─────────▼───────┐ ┌───────▼─────────┐ ┌──────────▼────────────────────┐
│  Banco SOAP     │ │  Banco REST     │ │  Comprovantes Service        │
│  (Java/Spring)  │ │  (Kotlin/Spring)│ │  (Python)                    │
│                 │ │                 │ │                              │
│  - TED          │ │  - PIX          │ │  ┌────────────────────────┐ │
│  - Saldo        │ │  - Extrato      │ │  │   ReportLab            │ │
│  - Contas       │ │  - Chaves PIX   │ │  │   (Geração de PDF)     │ │
│                 │ │                 │ │  └────────────────────────┘ │
└─────────────────┘ └─────────────────┘ └───────────────────────────────┘
```

## Fluxo de Geração de Comprovante (gRPC)

```
┌─────────┐                                ┌─────────────┐                           ┌──────────────┐
│ Usuario │                                │ API Gateway │                           │  Comprovante │
│         │                                │ (TypeScript)│                           │  Srv (Python)│
└────┬────┘                                └──────┬──────┘                           └──────┬───────┘
     │                                            │                                          │
     │ 1. Realiza transação PIX/TED              │                                          │
     ├──────────────────────────────────────────>│                                          │
     │                                            │                                          │
     │ 2. Clica "Gerar Comprovante"              │                                          │
     ├──────────────────────────────────────────>│                                          │
     │    POST /comprovantes/gerar               │                                          │
     │    (JSON)                                  │                                          │
     │                                            │ 3. Chama gRPC                           │
     │                                            │    GerarComprovante()                    │
     │                                            ├─────────────────────────────────────────>│
     │                                            │    (Protocol Buffers)                    │
     │                                            │    - tipo_transacao: "PIX"               │
     │                                            │    - conta_origem: "123456"              │
     │                                            │    - conta_destino: "email@exemplo.com"  │
     │                                            │    - valor: 100.50                       │
     │                                            │    - data_hora: ISO timestamp            │
     │                                            │    - id_transacao: "PIX_1234567"         │
     │                                            │                                          │
     │                                            │                   4. Gera PDF           │
     │                                            │                      (ReportLab)         │
     │                                            │                   ┌─────────────┐       │
     │                                            │                   │ - Cabeçalho │       │
     │                                            │                   │ - Dados     │       │
     │                                            │                   │ - Valor     │       │
     │                                            │                   │ - Rodapé    │       │
     │                                            │                   └─────────────┘       │
     │                                            │ 5. Retorna PDF (bytes)                  │
     │                                            │<─────────────────────────────────────────┤
     │                                            │    (Protocol Buffers)                    │
     │                                            │    - pdf_data: <bytes>                   │
     │                                            │    - filename: "comprovante_pix_..."     │
     │                                            │    - success: true                       │
     │ 6. Download do PDF                        │                                          │
     │<──────────────────────────────────────────┤                                          │
     │    (Content-Type: application/pdf)        │                                          │
     │                                            │                                          │
```

## Comunicação gRPC Detalhada

```
┌────────────────────────────────────────────────────────────────┐
│              COMUNICAÇÃO gRPC (HTTP/2)                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Cliente (TypeScript)              Servidor (Python)          │
│  ──────────────────                ────────────────           │
│                                                                │
│  1. Carrega comprovante.proto      1. Carrega comprovante.proto│
│     ↓                                  ↓                       │
│  2. Gera stubs TypeScript          2. Gera stubs Python       │
│     (proto-loader)                    (grpc_tools.protoc)     │
│     ↓                                  ↓                       │
│  3. Cria cliente gRPC              3. Implementa serviço      │
│     ComprovanteService                ComprovanteServicer     │
│     ↓                                  ↓                       │
│  4. Conecta em                     4. Escuta em               │
│     comprovantes-service:50051        0.0.0.0:50051          │
│     ↓                                  ↓                       │
│  5. Serializa mensagem             5. Recebe mensagem         │
│     ComprovanteRequest                serializada             │
│     para Protocol Buffers             ↓                       │
│     ↓                              6. Deserializa para        │
│  6. Envia via HTTP/2                  objetos Python          │
│     ↓                                  ↓                       │
│  7. Aguarda resposta               7. Processa (gera PDF)     │
│     ↓                                  ↓                       │
│  8. Recebe resposta                8. Serializa resposta      │
│     serializada                       ComprovanteResponse     │
│     ↓                                  ↓                       │
│  9. Deserializa para               9. Envia via HTTP/2        │
│     objetos TypeScript                ↓                       │
│     ↓                              10. Aguarda próxima        │
│  10. Usa os dados                      requisição             │
│      (pdf_data bytes)                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Protocol Buffers - Definição

```protobuf
syntax = "proto3";

package comprovante;

service ComprovanteService {
  rpc GerarComprovante (ComprovanteRequest) returns (ComprovanteResponse);
}

message ComprovanteRequest {
  string tipo_transacao = 1;    // "PIX" ou "TED"
  string conta_origem = 2;      // Número da conta origem
  string conta_destino = 3;     // Número da conta destino ou chave PIX
  double valor = 4;             // Valor da transação
  string data_hora = 5;         // Data/hora ISO 8601
  string id_transacao = 6;      // ID único da transação
}

message ComprovanteResponse {
  bytes pdf_data = 1;           // Conteúdo do PDF em bytes
  string filename = 2;          // Nome do arquivo sugerido
  bool success = 3;             // Sucesso da operação
  string message = 4;           // Mensagem de erro/sucesso
}
```

## Vantagens do gRPC Nesta Implementação

```
┌───────────────────────────────────────────────────────────────┐
│                    VANTAGENS DO gRPC                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 🚀 Performance                                            │
│     • HTTP/2 multiplexing                                     │
│     • Serialização binária (Protocol Buffers)                │
│     • Menor overhead que REST/JSON                            │
│                                                               │
│  2. 📝 Contrato Fortemente Tipado                            │
│     • Definição .proto compartilhada                          │
│     • Validação automática de tipos                           │
│     • Documentação auto-gerada                                │
│                                                               │
│  3. 🔄 Transferência Eficiente de Binários                   │
│     • PDFs como bytes nativos                                 │
│     • Sem encoding Base64                                     │
│     • Redução de tamanho (~33% menor que Base64)             │
│                                                               │
│  4. 🌐 Multiplataforma                                        │
│     • Python (servidor)                                       │
│     • TypeScript (cliente)                                    │
│     • Mesmo protocolo, linguagens diferentes                  │
│                                                               │
│  5. 🔌 Desacoplamento                                         │
│     • Serviço independente                                    │
│     • Escalável separadamente                                 │
│     • Fácil substituição/upgrade                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
projeto-DSD/
│
├── ComprovantesService/              # 🐍 Serviço Python (gRPC Server)
│   ├── comprovante.proto             # Definição Protocol Buffers
│   ├── server.py                     # Servidor gRPC
│   ├── requirements.txt              # Dependências Python
│   ├── Dockerfile                    # Container Docker
│   └── README.md                     # Documentação
│
├── BancoApiGateway/                  # 🟦 API Gateway (gRPC Client)
│   └── api-gateway/
│       ├── proto/
│       │   └── comprovante.proto     # Cópia do .proto
│       └── src/
│           ├── comprovantes-grpc/    # Cliente gRPC
│           │   ├── comprovantes-grpc.module.ts
│           │   └── comprovantes-grpc.service.ts
│           └── comprovantes/         # Controller REST
│               ├── comprovantes.module.ts
│               └── comprovantes.controller.ts
│
├── BancoCliente/                     # 🌐 Frontend
│   ├── index.html                    # Interface (botões)
│   └── script.js                     # Lógica de chamada
│
├── docker-compose.yaml               # Orquestração completa
└── GRPC_IMPLEMENTATION.md            # Esta documentação
```

## Portas Utilizadas

```
┌─────────────────┬────────┬──────────────────────┐
│ Serviço         │ Porta  │ Protocolo            │
├─────────────────┼────────┼──────────────────────┤
│ API Gateway     │ 8000   │ HTTP REST            │
│ Banco SOAP      │ 8081   │ SOAP (HTTP)          │
│ Banco REST      │ 8082   │ HTTP REST            │
│ WebSocket Srv   │ 8083   │ WebSocket            │
│ RabbitMQ        │ 5672   │ AMQP                 │
│ RabbitMQ UI     │ 15672  │ HTTP                 │
│ PostgreSQL      │ 5433   │ PostgreSQL           │
│ Comprovantes    │ 50051  │ gRPC (HTTP/2)        │ ✨ NOVO
└─────────────────┴────────┴──────────────────────┘
```

---

**Nota**: Este diagrama ilustra a arquitetura completa do sistema com foco na implementação gRPC para geração de comprovantes.
