# Projeto DSD

**Repositório para o projeto da disciplina de Desenvolvimento de Sistemas Distribuídos.**

## Visão geral do sistema

Este projeto simula um **sistema bancário distribuído** usando múltiplos backends (SOAP e REST) integrados por um **API Gateway**. Permite operações típicas como criação de clientes/contas, consultas de saldo, realização de transferências (TED via SOAP, PIX via REST), além de possuir cliente web didático em HTML/Tailwind e um cliente Python para teste via terminal.


- **API Gateway**: Orquestra e redireciona chamadas para os sistemas SOAP e REST.
- **Backend SOAP**: Java Spring Boot, simula sistema legado (operações tradicionais).
- **Backend REST**: Kotlin Spring Boot, adiciona operações modernas (PIX, extrato).
- **Serviço gRPC**: Python, gera comprovantes de transações em PDF (comunicação gRPC).
- **Cliente Web**: Interface HTML/Tailwind para testar todos os fluxos.
- **Cliente Python**: Ferramenta de linha de comando para interagir com o gateway.

---

## Estrutura dos diretórios
```
projeto-DSD/
├── docker-compose.yaml          # Orquestração de todos os serviços com Docker
├── .gitignore                   # Arquivos a ignorar no Git
├── README.md                    # Este arquivo
│
├── BancoApiGateway/             # API Gateway (NestJS) - Cliente gRPC
│   ├── Dockerfile               # Imagem Docker do Gateway
│   ├── src/                     # Código-fonte
│   │   ├── comprovantes-grpc/   # Cliente gRPC (TypeScript)
│   │   └── comprovantes/        # Controller REST para comprovantes
│   └── package.json
│
├── ComprovantesService/         # Serviço de Comprovantes (Python) - Servidor gRPC
│   ├── comprovante.proto        # Definição Protocol Buffers
│   ├── server.py                # Servidor gRPC Python
│   ├── requirements.txt         # Dependências Python
│   ├── Dockerfile               # Imagem Docker do serviço
│   └── README.md                # Documentação do serviço
│
├── BancoCoreSOAP/               # Backend SOAP (Spring Boot - Java)
│   ├── Dockerfile               # Imagem Docker do serviço SOAP
│   ├── src/                     # Código-fonte
│   └── pom.xml
│
├── BancoRestApi/                # Backend REST (Spring Boot - Kotlin)
│   ├── Dockerfile               # Imagem Docker do serviço REST
│   ├── src/                     # Código-fonte
│   └── pom.xml
│
└── BancoCliente/                # Cliente web + Cliente Python
    ├── index.html               # Interface web (HTML + Tailwind CSS)
    └── cliente_banco.py         # Cliente de terminal (Python)
```
---

## 1. Pré-requisitos

- **Docker** (20.10+, para containerização)
- **Docker Compose** (2.0+, para orquestração dos serviços)
- **Node.js** (v18, para os serviços Nest.JS)
- **Java 21** (para os serviços Spring Boot)
- **Python 3.11+** (para o serviço gRPC de comprovantes)
- **Kotlin** (integrado no Spring Boot, já configurado via Maven)
- **Python 3.9** (para o cliente terminal)
- **PostgreSQL 14** (para persistência dos sistemas REST e SOAP)

### Portas Utilizadas

```
┌──────────────────┬────────┬──────────────────────┐
│ Serviço          │ Porta  │ Protocolo            │
├──────────────────┼────────┼──────────────────────┤
│ API Gateway      │ 8000   │ HTTP REST            │
│ Banco SOAP       │ 8081   │ SOAP (HTTP)          │
│ Banco REST       │ 8082   │ HTTP REST            │
│ WebSocket Srv    │ 8083   │ WebSocket            │
│ RabbitMQ         │ 5672   │ AMQP                 │
│ RabbitMQ UI      │ 15672  │ HTTP                 │
│ PostgreSQL       │ 5433   │ PostgreSQL           │
│ Comprovantes     │ 50051  │ gRPC (HTTP/2)        │ 
│ ATM Heartbeat    | 6000   │ UDP (Broadcast)      │
│ ATM Commands     │ 6001   │ TCP (Conexão)        │
│ Gateway Interface│ 6002   │ TCP (Conexão)        │
└──────────────────┴────────┴──────────────────────┘
```


---

## 2. Clonando o repositório

No terminal:
```
git clone https://github.com/DanielBR0612/projeto-DSD.git
cd projeto-DSD
```
---

## 3. Configuração do Banco de Dados

Crie os bancos citados nos arquivos de configuração dos serviços REST e SOAP (localizado nas `application.properties` ou via PostgreSQL padrão, nas portas 5432).

Configure as credenciais conforme os arquivos:

- Banco REST: `BancoRestApi/src/main/resources/application.properties`
- Banco SOAP: `BancoCoreSOAP/src/main/resources/application.properties`

> Exemplos de configuração (ajuste caso mude usuário/senha/porta):
```
spring.datasource.url=jdbc:postgresql://localhost:5432/banco_dsd
spring.datasource.username=postgres
spring.datasource.password=postgres
```

> Criando o banco de dados pelo terminal:
```
psql -U postgres
CREATE DATABASE banco_dsd
\q
```
---

## 4. Inicializando os serviços

### Usando Docker Compose

Para inicializar todos os serviços (PostgreSQL, Bancos Backend, API Gateway, RabbitMQ), execute:

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Backend SOAP (BancoCoreSOAP) na porta 8080
- Backend REST (BancoRestApi) na porta 8081  
- API Gateway (BancoApiGateway) na porta 3000
- RabbitMQ Management na porta 15672

**Parar os serviços:**

```bash
docker-compose down
```

> **Nota Importante:** Os arquivos `docker-compose.yaml` e Dockerfiles de cada serviço já estão configurados na branch `rabbit`. Certifique-se de estar na branch correta antes de executar o comando acima.
---

## 5. Cliente Web (HTML + Tailwind CSS)

- Abra o arquivo: `BancoCliente/index.html` diretamente pelo navegador.
- Todos os fluxos podem ser testados via formulários didáticos:
  - **Criar Cliente** (SOAP)
  - **Criar Conta** (SOAP)
  - **Consultar Saldo** (SOAP)
  - **Consultar Extrato** (REST)
  - **Transferência TED** (SOAP)
  - **Criar Chave PIX** (REST)
  - **Transferência PIX** (REST)

---

## 6. Cliente Python (Terminal)

### Instalando dependências
```
cd BancoCliente
pip install requests
```

### Executando
```
python cliente_banco.py
```

O cliente exibirá um menu com opções de consultar saldo e transferências. Verifique se o API Gateway está rodando na porta 3000!

---

## 7. Fluxos para Teste

1. **Inicie os serviços com Docker Compose** executando `docker-compose up -d` na raiz do projeto (veja Seção 4).

2. **Use o Cliente Web**:
   - Primeiro crie um novo cliente (SOAP).
   - Segundo crie uma conta para o cliente (SOAP).
   - Em seguida Consulte saldo/extrato.
   - Crie e vincule chave PIX para transferências REST.
   - Realize transferências (TED/PIX).

3. **Teste pelo Cliente Python**:
   - Utilize o menu para consultar saldo e realizar transferências.
   - Observe as respostas e mensagens de erro (status/conexão).

4. **Observação sobre integração**:
   - O gateway recebe as requisições e decide dinamicamente para qual backend enviar, conforme operação (TED: SOAP, PIX: REST).

---

## 8. Tecnologias Utilizadas

- **NestJS** (API Gateway, Node/TypeScript)
- **Spring Boot** (Java e Kotlin, serviços SOAP/REST)
- **HTML & Tailwind CSS** (cliente web didático)
- **Python** (cliente de terminal)
- **PostgreSQL** (persistência)
- **RabbitMQ** (fila de mensagens para notificações persistentes)

---

## 9. Dúvidas frequentes

- Se algum serviço não inicializar, revise dependências e variáveis de ambiente.
- Os logs de erro geralmente detalham problemas de conexão/porta.
- O projeto é inteiramente didático; refatore conforme necessário para seus testes.

---

## 10. Implementação de websocket

Notificações por WebSocket autenticadas por JWT e integração com o API Gateway.

   - Validação de JWT no handshake: o cliente envia `?token=<JWT>&clienteId=<id>` no URL de conexão; o `ws-service` valida o token com a variável de ambiente `WS_JWT_SECRET` e usa o claim `sub` (ou `clienteId`) como identificador do cliente.
   - Arquivo principal: `ws-service/src/index.ts` (le `process.env.WS_JWT_SECRET`).
   - Ferramenta de desenvolvimento para gerar tokens: `ws-service/tools/generateToken.js` (gera token com `sub = clienteId`).
   - Você pode colar o token em um input `id="wsToken"` na página ou definir `window.CLIENT_WS_TOKEN = '<token>'` no console antes de conectar.
   - Mantunção de apenas uma conexão WebSocket por cliente (fecha a anterior ao abrir nova).
   - `NotificationsService` foi adicionado nos controladores de transferência (TED e PIX). O gateway faz POST para o `ws-service` `/notify` para solicitar envio de notificações quando houver transferência.

### Como usar:

1. Defina o segredo JWT para o `ws-service`:

```bash
cd /workspaces/projeto-DSD/ws-service
export WS_JWT_SECRET=$(openssl rand -hex 32)
npm run dev
```

2. Gere um token de teste (no mesmo terminal ou com a mesma variável de ambiente):

```bash
node tools/generateToken.js 12345
# saída: <JWT>
```

3. No cliente web (`BancoCliente/index.html`): cole o token no campo `#wsToken` (ou defina `window.CLIENT_WS_TOKEN`) e preencha o campo "Conta Destino TED" (ou chave PIX conforme sua configuração). O cliente fará handshake com `?token=<JWT>&clienteId=<id>`.

4. Faça uma transferência TED/PIX pelo cliente ou via API Gateway; o gateway chama `/notify` no `ws-service` e, se o destinatário estiver conectado e autenticado, receberá o evento `nova-transacao` via WebSocket.


---

## 11. Implementação de Fila RabbitMQ para Notificações Persistentes

Fila de mensagens utilizando RabbitMQ para garantir a persistência e entrega de notificações de transferências, mesmo quando o cliente não está conectado ao WebSocket, justamente eveitando que as notificações sejam perdidas caso ocliente se desconectasse. Esta implementação permite que as mensagens são enfileiradas e entregues quando o cliente reconecta.

### Arquitetura da Solução

```
TED/PIX (SOAP/REST)
        ↓
   NotificationService
        ↓
   RabbitMQ (Fila Persistente)
        ↓
   ws-service (Consumer)
        ↓
   WebSocket → Cliente
```

**Fluxo:**
1. Cliente realiza transferência TED (SOAP) ou PIX (REST)
2. Backend persiste transação e publica notificação na fila RabbitMQ
3. ws-service consome mensagens da fila
4. Se cliente online: entrega imediata via WebSocket
5. Se cliente offline: mensagem fica na fila até reconexão (TTL: 24h)
6. Mensagens com erro: movidas para Dead Letter Queue (DLQ) para análise

### Como usar

#### 1. Iniciar Docker

```bash
docker-compose up -d
```

Isso inicia: PostgreSQL, RabbitMQ (painel em http://localhost:15672)

#### 2. Iniciar Backends em Terminais Separados

```bash
# Terminal 1
cd BancoCoreSOAP && ./mvnw spring-boot:run

# Terminal 2
cd BancoRestApi && ./mvnw spring-boot:run

# Terminal 3
cd BancoApiGateway/api-gateway && npm install && npm run start:dev

# Terminal 4
cd ws-service && npm install && export WS_JWT_SECRET=$(openssl rand -hex 32) && npm run dev
```

#### 3. Testar

**Cliente Online:**
1. Abra `BancoCliente/index.html`
2. Cole token JWT no campo `#wsToken`
3. Realize transferência PIX ou TED
4. Notificação entregue imediatamente via WebSocket 

**Cliente Offline:**
1. Feche conexão WebSocket
2. Realize transferência
3. Reconecte ao WebSocket
4. Notificações atrasadas entregues automaticamente 

### Monitoramento

**Painel RabbitMQ:** `http://localhost:15672` (guest/guest)
- Visualizar filas e mensagens
- Verificar Dead Letter Queue
- Monitorar saúde da fila

### Benefícios

- Notificações persistentes (24h TTL)
- Funciona para TED e PIX simultaneamente
- Sem perda de mensagens

---
## 12. Implementação TCP/UDP - Monitoramento de caixas eletrônicos (ATM)

Aqui deup-se a implementação de um **sistema distribuído de monitoramento de caixas eletrônicos (ATMs)** que utiliza protocolos **TCP e UDP** para comunicação em tempo real entre o gateway e uma frota de terminais espalhados geograficamente.

### Arquitetura
```
Frontend (HTML/JS)
    ↓ HTTP REST
API Gateway (TypeScript/NestJS)
    ↓ TCP (Port 6002)
Monitor ATM (Node.js Puro)
    ↑↓ UDP (Port 6000) - Heartbeat/Telemetria
    ↑↓ TCP (Port 6001) - Comandos Críticos
Cluster de ATMs (3 máquinas simuladas)
```

### Componentes Implementados

#### 1. **Monitor Server** (`monitor-server.ts`)
Servidor central que gerencia a frota de ATMs:

- **UDP Server (Porta 6000)**: Recebe heartbeats periódicos de cada ATM
  - Coleta status de saúde, saldo em caixa e IP
  - Atualiza registro em tempo real
  - Detecta máquinas offline via timeout

- **TCP Server para ATMs (Porta 6001)**: Aceita conexões de ATMs clientes
  - Registra máquinas quando conectam (`REGISTER:ATM-ID`)
  - Enfileira comandos críticos para execução imediata
  - Mantém socket aberto durante sessão

- **TCP Server para Gateway (Porta 6002)**: Interface com API Gateway
  - `GET_ALL` → Lista todas as máquinas e status
  - `BLOCK:ATM-ID` → Envia comando de bloqueio (desligamento)
  - `ABASTECER:ATM-ID:VALOR` → Reabastece saldo em dinheiro

#### 2. **ATM Cluster** (`atm-cluster.ts`)
Simula uma frota realista de 3 caixas eletrônicos:

**Máquinas simuladas:**
- `ATM-CENTRO-01` (R$ 50.000 inicial)
- `ATM-SHOPPING-02` (R$ 85.000 inicial)
- `ATM-AEROPORTO-03` (R$ 120.000 inicial)

**Cada ATM executa:**
- **Conexão TCP**: Registra-se no monitor e aguarda comandos
- **Loop UDP**: Envia heartbeat a cada 2-3 segundos com status
- **Simulação de Saque**: Reduz saldo em ~20% dos batidas
- **Recepção de Comandos**: 
  - `CMD_LOCK` → Desativa máquina e encerra sessão
  - `CMD_REFILL:VALOR` → Adiciona dinheiro ao saldo

#### 3. **Entidade ATM** (`atm.entity.ts`)
Modelo de dados representando um caixa eletrônico:

```typescript
- id: string (identificador único)
- ip: string (endereço IP)
- dinheiro: number (saldo em reais)
- status: 'ONLINE' | 'OFFLINE' | 'BLOCKED'
- lastSeen: Date (último heartbeat recebido)
```

#### 4. **Camada REST no Gateway** (`atm.controller.ts` e `atm.service.ts`)

Endpoints expostos para controle remoto:

- `GET /atms` → Lista todas as máquinas com status
- `POST /atms/block` → Envia comando TCP para bloquear um ATM
- `POST /atms/refill` → Envia comando TCP para reabastecer dinheiro

### Como Funciona o Fluxo de Dados

**Cenário 1: Consultar Status**
```
Frontend → GET /atms 
→ Gateway abre TCP para Monitor (6002)
→ Envia "GET_ALL"
→ Monitor retorna JSON com lista de ATMs
→ Gateway retorna para Frontend
```

**Cenário 2: Bloquear ATM (Operação Crítica)**
```
Frontend → POST /atms/block {id: "ATM-CENTRO-01"}
→ Gateway abre TCP para Monitor (6002)
→ Envia "BLOCK:ATM-CENTRO-01"
→ Monitor acha socket TCP da máquina (conectado na porta 6001)
→ Envia "CMD_LOCK" via TCP direto
→ ATM recebe comando, desativa sistema e envia status "BLOCKED"
→ Máquina encerra conexões
```

### Protocolo de Heartbeat (UDP)

Cada ATM envia payload JSON a cada 2-3 segundos:

```json
{
  "id": "ATM-CENTRO-01",
  "status": "ONLINE",
  "dinheiro": 48950
}
```

O Monitor registra o IP do remetente e timestamp, permitindo:
- Detectar máquinas offline (sem heartbeat por 5s)
- Validar saldo em tempo real
- Mapear geolocalização (via IP)

### Interface Web de Monitoramento

A página `BancoCliente/index.html` inclui aba "Monitoramento de Frota (ATMs)" com:

- **Tabela em Tempo Real**: Mostra todas as máquinas conectadas
  - ID do terminal
  - IP registrado
  - Status (ONLINE/OFFLINE/BLOCKED)
  - Saldo em R$
  - Último heartbeat

- **Ações Disponíveis**:
  - 🚫 **Bloquear**: Desliga máquina via TCP (requer confirmação)
  - 💰 **Reabastecer**: Adiciona saldo (executa via TCP)

---

## 13. Implementação gRPC - Geração de Comprovantes

Nessa etapa foi implementa comunicação **gRPC** entre dois serviços em **linguagens diferentes**:
- **Servidor Python**: Gera comprovantes de transações em PDF
- **Cliente TypeScript**: API Gateway solicita a geração via gRPC

### Como funciona? 

Após realizar uma transação PIX ou TED, o usuário pode:
1. Clicar no botão **"📄 Gerar Comprovante PDF"**
2. O frontend envia requisição REST para o Gateway
3. O Gateway faz chamada **gRPC** para o serviço Python
4. O serviço Python gera um PDF profissional usando ReportLab
5. O PDF é retornado via gRPC e baixado automaticamente

### Arquitetura

```
Frontend (HTML/JS) 
    ↓ HTTP REST
API Gateway (TypeScript/NestJS)
    ↓ gRPC (Protocol Buffers)
Serviço Comprovantes (Python)
    → Gera PDF (ReportLab)
```

### Componentes Principais

#### 1. **Servidor gRPC (Python)** 
- **Arquivo**: `ComprovantesService/server.py`
- **Porta**: 50051
- **Função**: Recebe requisições gRPC e gera PDFs usando ReportLab
- **Tecnologias**: `grpcio`, `reportlab`

#### 2. **Cliente gRPC (TypeScript)** 
- **Arquivo**: `BancoApiGateway/api-gateway/src/comprovantes-grpc/`
- **Função**: Conecta-se ao servidor Python e solicita geração de comprovantes
- **Tecnologias**: `@grpc/grpc-js`, `@grpc/proto-loader`, NestJS

#### 3. **Protocol Buffers** 
- **Arquivo**: `comprovante.proto`
- **Define**: Interface de comunicação entre cliente e servidor
- **Mensagens**: `ComprovanteRequest`, `ComprovanteResponse`

#### 4. **Endpoint REST** 
- **Rota**: `POST /comprovantes/gerar`
- **Função**: Recebe requisição do frontend, chama gRPC, retorna PDF

#### Tecnologias
- **Python** - `ReportLab` para PDF e Biblioteca `grpcio`
- **TypeScript** - NestJS para API e Bibliotecas `@grpc/grpc-js` e `@grpc/proto-loader`
- **Protocol Buffers** - Serialização

### Porta do Serviço gRPC:

- **50051** - Serviço de Comprovantes (Python)

---

## 14. Créditos

**[Daniel Braga](https://github.com/DanielBR0612) & [Josephy Araújo](https://github.com/seu-usuario-github) — IFRN**


