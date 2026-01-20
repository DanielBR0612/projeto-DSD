# ⚡ Quick Start - gRPC Comprovantes

## 🎯 5 Minutos para Testar

### 1. Clone e entre no projeto
```bash
cd projeto-DSD
```

### 2. Inicie os serviços
```bash
docker-compose up --build
```
⏱️ Aguarde ~2-3 minutos para todos os serviços iniciarem

### 3. Abra o frontend
```bash
# Abra BancoCliente/index.html no navegador
# Ou use Live Server no VS Code
```

### 4. Faça login
- **Usuário**: `190612`
- **Senha**: `senha123`

### 5. Teste o gRPC

#### Opção A: Via Frontend (Mais Visual)
1. **Realizar PIX**
   - Conta Origem: `190612`
   - Chave Destino: `190612`
   - Valor: `100.50`
   - Clique em "Transferir via PIX"

2. **Gerar Comprovante**
   - Clique em "📄 Gerar Comprovante PDF"
   - PDF será baixado automaticamente
   - Abra e visualize o comprovante

#### Opção B: Via Terminal (Mais Rápido)
```bash
# Teste automatizado
./test_grpc.sh

# Ou teste manual
curl -X POST http://localhost:8000/comprovantes/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_transacao": "PIX",
    "conta_origem": "123456",
    "conta_destino": "usuario@email.com",
    "valor": 100.50,
    "data_hora": "2026-01-20T14:30:00Z",
    "id_transacao": "PIX_TEST"
  }' \
  -o comprovante.pdf && open comprovante.pdf
```

---

## ✅ Verificação Rápida

### Todos os serviços estão rodando?
```bash
docker ps
```
Deve mostrar:
- ✅ `container_gateway` (porta 8000)
- ✅ `container_comprovantes` (porta 50051) ← **NOVO**
- ✅ `container_soap` (porta 8081)
- ✅ `container_rest` (porta 8082)
- ✅ `container_ws` (porta 8083)
- ✅ `db_sistema` (porta 5433)
- ✅ `projeto-dsd-rabbitmq` (porta 5672)

### Servidor gRPC está funcionando?
```bash
docker logs container_comprovantes
```
Deve mostrar:
```
🚀 Servidor gRPC de Comprovantes iniciado na porta 50051
📄 Aguardando requisições de geração de comprovantes...
```

### Cliente gRPC conectou?
```bash
docker logs container_gateway | grep gRPC
```
Deve mostrar:
```
✅ Cliente gRPC conectado ao servidor: comprovantes-service:50051
```

---

## 🎨 O que você verá

### No Frontend:
1. Formulário de transferência PIX/TED
2. Resultado da transação em JSON
3. **Botão azul "📄 Gerar Comprovante PDF"** ← NOVO
4. Download automático do PDF

### No PDF:
```
╔══════════════════════════════════════════╗
║   COMPROVANTE DE TRANSAÇÃO              ║
║   Banco DSD - Sistema Distribuído       ║
╠══════════════════════════════════════════╣
║                                          ║
║   [PIX]                                 ║
║                                          ║
║   ID: PIX_1234567890                    ║
║   Data: 20/01/2026 às 14:30             ║
║   Origem: 123456                         ║
║   Destino: usuario@email.com            ║
║                                          ║
║   ┌────────────────────────────────┐   ║
║   │  R$ 100,50                     │   ║
║   └────────────────────────────────┘   ║
║                                          ║
╚══════════════════════════════════════════╝
```

---

## 🐛 Problema?

### Porta 8000 já está em uso
```bash
# Mude a porta no docker-compose.yaml
# Linha: "8000:3000" → "8001:3000"
```

### Serviço comprovantes não inicia
```bash
# Rebuilde apenas o serviço
docker-compose up --build comprovantes-service
```

### PDF não baixa
```bash
# 1. Verifique se realizou a transação primeiro
# 2. Teste via cURL (comando acima)
# 3. Veja console do navegador (F12)
```

---

## 📖 Documentação Completa

- **[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)** ← Comece aqui
- **[GRPC_IMPLEMENTATION.md](GRPC_IMPLEMENTATION.md)** - Detalhes técnicos
- **[ARQUITETURA_GRPC.md](ARQUITETURA_GRPC.md)** - Diagramas
- **[INSTALACAO_GRPC.md](INSTALACAO_GRPC.md)** - Troubleshooting

---

## 🎯 Demonstração para Professor

### Passo a Passo Visual

1. **Mostrar arquitetura**
   ```bash
   cat ARQUITETURA_GRPC.md
   ```

2. **Mostrar código .proto**
   ```bash
   cat ComprovantesService/comprovante.proto
   ```

3. **Iniciar serviços**
   ```bash
   docker-compose up --build
   ```

4. **Mostrar logs do servidor Python**
   ```bash
   docker logs -f container_comprovantes
   ```

5. **Realizar transação no frontend**
   - Abrir `BancoCliente/index.html`
   - Login + Transferência PIX

6. **Gerar comprovante**
   - Clicar no botão
   - Mostrar PDF gerado

7. **Mostrar comunicação gRPC nos logs**
   ```bash
   # Terminal 1: Servidor Python
   docker logs -f container_comprovantes
   
   # Terminal 2: Cliente TypeScript
   docker logs -f container_gateway | grep gRPC
   ```

---

## ✨ Destaques

### Por que este projeto é especial?

1. **🌍 Duas linguagens reais**
   - Python ↔ TypeScript
   - Não apenas "Hello World"

2. **📄 Aplicação prática**
   - Geração real de PDFs
   - Não apenas strings ou números

3. **🎨 Design profissional**
   - PDF com layout bonito
   - Marca d'água, cores, formatação

4. **🔗 Integração completa**
   - Frontend → Gateway → gRPC → Python
   - Sistema end-to-end funcionando

5. **📚 Documentação completa**
   - 7 arquivos de documentação
   - Diagramas, exemplos, testes

---

## 🚀 Próximo Nível

Quer impressionar ainda mais? Adicione:

### 1. Assinatura Digital
```python
# No server.py, adicione
from reportlab.graphics.barcode import qr
```

### 2. Envio por Email
```python
# Integre com SMTP
import smtplib
```

### 3. Histórico de Comprovantes
```typescript
// No banco de dados
// Salve referência ao comprovante gerado
```

---

**🎉 Pronto! Você tem um sistema completo de geração de comprovantes via gRPC!**

**Tempo total**: 5 minutos ⚡  
**Dificuldade**: Fácil 🟢  
**Impacto**: Alto 🔥
