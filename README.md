# Projeto DSD

**Repositório para o projeto da disciplina de Desenvolvimento de Sistemas Distribuídos.**

## Visão geral do sistema

Este projeto simula um **sistema bancário distribuído** usando múltiplos backends (SOAP e REST) integrados por um **API Gateway**. Permite operações típicas como criação de clientes/contas, consultas de saldo, realização de transferências (TED via SOAP, PIX via REST), além de possuir cliente web didático em HTML/Tailwind e um cliente Python para teste via terminal.

- **API Gateway**: Orquestra e redireciona chamadas para os sistemas SOAP e REST.
- **Backend SOAP**: Java Spring Boot, simula sistema legado (operações tradicionais).
- **Backend REST**: Kotlin Spring Boot, adiciona operações modernas (PIX, extrato).
- **Cliente Web**: Interface HTML/Tailwind para testar todos os fluxos.
- **Cliente Python**: Ferramenta de linha de comando para interagir com o gateway.

---

## Estrutura dos diretórios

projeto-DSD/

├── BancoApiGateway/ # API Gateway (NestJS)

├── BancoCoreSOAP/ # Backend SOAP (Spring Boot - Java)

├── BancoRestApi/ # Backend REST (Spring Boot - Kotlin)

├── BancoCliente/ # Cliente web + Cliente Python

---

## 1. Pré-requisitos

- **Node.js** (v18, para os serviços Nest.JS)
- **Java 21** (para os serviços Spring Boot)
- **Kotlin** (integrado no Spring Boot, já configurado via Maven)
- **Python 3.9** (para o cliente terminal)
- **PostgreSQL 14** (para persistência dos sistemas REST e SOAP)

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
Dica: recomendamos inicializar primeiro o sistema legado SOAP, em seguida o sistema REST e só então criar banco de dados.

---

## 4. Inicializando os serviços

### 4.1 Backend SOAP (Java Spring Boot)
```
cd BancoCoreSOAP
./mvnw spring-boot:run
```
ou pleo IDE, clicando com o botão direto do mouse sobre o arquivo **BancoCoreSoapApplication.java** e selecionando "Run as java application" (Eclipse). 

- Por padrão roda na porta **8080**

### 4.2 Backend REST (Kotlin Spring Boot)
```
cd BancoRestApi
./mvnw spring-boot:run
```
ou pleo IDE, clicando com o botão direto do mouse sobre o arquivo **BancoRestApiApplication.kt** e selecionando "Run" (IntelliJ IDEA). 

- Por padrão roda na porta **8081**

### 4.3 API Gateway (NestJS/Node.js)
```
cd BancoApiGateway/api-gateway
npm install
npm run start:dev
```
- Roda na porta **3000**
- O gateway redireciona chamadas REST/SOAP para os respectivos backends

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

> ⚠️ Certifique-se de que os serviços acima estão rodando antes de usar.

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

1. **Inicie todos os serviços** (Gateway, REST, SOAP) em terminais diferentes. 

    Dica: Para uma melhor experiência recomendamos o uso dos IDE Eclipse para o SOAP (Java), IntelliJ IDEA para o REST (Kotlin) e o VSCode para o Gateway (Nest.JS).

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

Como usar:

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

## 11. Créditos

**[Daniel Braga](https://github.com/DanielBR0612) & [Josephy Araújo](https://github.com/seu-usuario-github) — IFRN**


