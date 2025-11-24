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

- **Node.js** (v18+), preferencialmente via [nodejs.org](https://nodejs.org)
- **Java 21+** (para os serviços Spring Boot)
- **Kotlin** (integrado no Spring Boot, já configurado via Maven)
- **Python 3.9+** (para o cliente terminal)
- **PostgreSQL** (para persistência dos sistemas REST e SOAP)

---

## 2. Clonando o repositório

No terminal:
```
git clone https://github.com/DanielBR0612/projeto-DSD.git
cd projeto-DSD
```
---

## 3. Configuração do Banco de Dados

Crie os bancos citados nos arquivos de configuração dos serviços REST e SOAP (geralmente `application.properties` ou via PostgreSQL padrão, nas portas 5432).

Configure as credenciais conforme os arquivos:

- Banco REST: `BancoRestApi/src/main/resources/application.properties`
- Banco SOAP: `BancoCoreSOAP/src/main/resources/application.properties`

> Exemplos de configuração (ajuste caso mude usuário/senha/porta):
```
spring.datasource.url=jdbc:postgresql://localhost:5432/banco_rest
spring.datasource.username=postgres
spring.datasource.password=postgres
```
---

## 4. Inicializando os serviços

### 4.1 Backend SOAP (Java Spring Boot)
```
cd BancoCoreSOAP
./mvnw spring-boot:run
```
- Por padrão roda na porta **8080**

### 4.2 Backend REST (Kotlin Spring Boot)
```
cd BancoRestApi
./mvnw spring-boot:run
```
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

1. **Inicie todos os serviços** (Gateway, REST, SOAP).
2. **Use o Cliente Web**:
   - Crie um novo cliente (SOAP).
   - Crie uma conta para o cliente (SOAP).
   - Consulte saldo/extrato, realize transferências (TED/PIX).
   - Crie e vincule chave PIX para transferências REST.

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
- O projeto é inteiramente didático; refatore conforme necessário para suas atividades.

---

## 10. Créditos

**[Daniel Braga](https://github.com/DanielBR0612) & [Josephy Araújo](https://github.com/seu-usuario-github) — IFRN**


