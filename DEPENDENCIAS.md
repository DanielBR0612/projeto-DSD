# 📦 Instalação de Dependências - Guia Completo

## ⚠️ Importante

Se você vê erros do TypeScript no VS Code sobre módulos não encontrados, é normal! As dependências npm ainda não foram instaladas localmente.

## 🔧 Instalação

### Opção 1: Via Docker (Recomendado - Mais Fácil)

**As dependências são instaladas automaticamente dentro dos containers.**

```bash
# Basta executar:
docker-compose up --build
```

✅ Pronto! Nada mais necessário.

### Opção 2: Local (Para Desenvolvimento)

Se você quer desenvolver localmente sem Docker:

#### 1. API Gateway (Node.js/TypeScript)

```bash
cd BancoApiGateway/api-gateway
npm install

# As novas dependências gRPC já estão no package.json:
# - @grpc/grpc-js@^1.10.1
# - @grpc/proto-loader@^0.7.12
```

#### 2. Serviço de Comprovantes (Python)

```bash
cd ComprovantesService
pip install -r requirements.txt

# Gerar stubs Python do .proto:
python -m grpc_tools.protoc \
    -I. \
    --python_out=. \
    --grpc_python_out=. \
    comprovante.proto

# Isso cria:
# - comprovante_pb2.py
# - comprovante_pb2_grpc.py
```

#### 3. Outros serviços (se necessário)

```bash
# Backend SOAP (Java)
cd BancoCoreSOAP
./mvnw clean install

# Backend REST (Kotlin)
cd BancoRestApi
./mvnw clean install

# WebSocket Service
cd ws-service
npm install
```

---

## 🚫 Erros Comuns e Soluções

### ❌ Erro: "Cannot find module '@grpc/grpc-js'"

**Causa**: Dependências npm não instaladas

**Solução**:
```bash
cd BancoApiGateway/api-gateway
npm install
```

### ❌ Erro: "Module 'comprovante_pb2' not found" (Python)

**Causa**: Stubs Python não foram gerados

**Solução**:
```bash
cd ComprovantesService
python -m grpc_tools.protoc \
    -I. \
    --python_out=. \
    --grpc_python_out=. \
    comprovante.proto
```

### ❌ Erro: "Port 50051 already in use"

**Causa**: Serviço já está rodando ou outra aplicação usa a porta

**Solução**:
```bash
# Encontre o processo
lsof -i :50051

# Mate o processo
kill -9 <PID>

# Ou mude a porta no docker-compose.yaml
```

### ❌ VS Code mostra erros de TypeScript

**Causa**: Dependências não instaladas OU VS Code não recarregou

**Solução**:
```bash
# 1. Instale as dependências
cd BancoApiGateway/api-gateway
npm install

# 2. Recarregue o VS Code
# Pressione: Ctrl+Shift+P (ou Cmd+Shift+P no Mac)
# Digite: "Reload Window"
# Pressione Enter
```

---

## ✅ Verificação

### Verificar instalação npm:

```bash
cd BancoApiGateway/api-gateway

# Verificar se as dependências gRPC foram instaladas
npm list @grpc/grpc-js
npm list @grpc/proto-loader
```

Saída esperada:
```
@grpc/grpc-js@1.10.1
@grpc/proto-loader@0.7.12
```

### Verificar instalação Python:

```bash
cd ComprovantesService

# Verificar pacotes instalados
pip list | grep grpc
```

Saída esperada:
```
grpcio               1.60.0
grpcio-tools         1.60.0
```

### Verificar stubs gerados:

```bash
cd ComprovantesService
ls -la | grep pb2
```

Saída esperada:
```
comprovante_pb2.py
comprovante_pb2_grpc.py
```

---

## 🐳 Usando Docker (Mais Simples)

**Vantagens:**
- ✅ Dependências instaladas automaticamente
- ✅ Ambiente isolado
- ✅ Funciona em qualquer SO
- ✅ Não precisa configurar nada manualmente

**Desvantagens:**
- ⚠️ Rebuild necessário após mudanças
- ⚠️ Usa mais recursos

```bash
# Inicia tudo de uma vez
docker-compose up --build

# Rebuild apenas um serviço
docker-compose up --build comprovantes-service

# Ver logs de um serviço
docker logs -f container_comprovantes

# Entrar no container para debug
docker exec -it container_comprovantes sh
```

---

## 💻 Desenvolvimento Local (Mais Rápido)

**Vantagens:**
- ✅ Hot reload automático
- ✅ Debug mais fácil
- ✅ Menos uso de recursos
- ✅ Desenvolvimento mais rápido

**Desvantagens:**
- ⚠️ Precisa instalar dependências manualmente
- ⚠️ Pode ter problemas de compatibilidade

### Setup para desenvolvimento local:

1. **Inicie apenas banco de dados e RabbitMQ com Docker:**
```bash
docker-compose up db rabbitmq
```

2. **Inicie os serviços localmente em terminais separados:**

```bash
# Terminal 1: Serviço Python gRPC
cd ComprovantesService
pip install -r requirements.txt
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. comprovante.proto
python server.py

# Terminal 2: Backend SOAP
cd BancoCoreSOAP
./mvnw spring-boot:run

# Terminal 3: Backend REST
cd BancoRestApi
./mvnw spring-boot:run

# Terminal 4: API Gateway
cd BancoApiGateway/api-gateway
npm install
npm run start:dev

# Terminal 5: WebSocket
cd ws-service
npm install
npm run dev
```

---

## 🔄 Atualização de Dependências

Se você modificar o `package.json` ou `requirements.txt`:

### Docker:
```bash
# Rebuild os containers
docker-compose up --build
```

### Local:
```bash
# API Gateway
cd BancoApiGateway/api-gateway
npm install

# Serviço Python
cd ComprovantesService
pip install -r requirements.txt
```

---

## 📝 Checklist Rápido

### Usando Docker:
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Executar: `docker-compose up --build`
- [ ] ✅ DONE!

### Desenvolvimento Local:
- [ ] Node.js 18+ instalado
- [ ] Python 3.11+ instalado
- [ ] Java 21 instalado
- [ ] Instalar deps npm: `npm install`
- [ ] Instalar deps Python: `pip install -r requirements.txt`
- [ ] Gerar stubs: `python -m grpc_tools.protoc ...`
- [ ] Iniciar todos os serviços manualmente

---

## 🎯 Recomendação

Para **testar e demonstrar**: Use Docker (mais fácil)  
Para **desenvolver**: Use local (mais rápido)

---

**Pronto! Dependências instaladas e ambiente configurado.**
