#!/bin/bash

# Script de Teste - Comunicação gRPC
# Testa a geração de comprovantes via gRPC

echo "🧪 Iniciando testes de comunicação gRPC"
echo "========================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:8000"
PASS_COUNT=0
FAIL_COUNT=0

# Função para verificar se serviço está rodando
check_service() {
    local service=$1
    local port=$2
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $service está rodando na porta $port"
        return 0
    else
        echo -e "${RED}✗${NC} $service NÃO está rodando na porta $port"
        return 1
    fi
}

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local response=$2
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✓${NC} $name"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}✗${NC} $name"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "1️⃣  Verificando serviços..."
echo "----------------------------"

check_service "API Gateway" 8000
check_service "Comprovantes gRPC" 50051
check_service "Banco SOAP" 8081
check_service "Banco REST" 8082

echo ""
echo "2️⃣  Testando geração de comprovante PIX..."
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST "$GATEWAY_URL/comprovantes/gerar" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_transacao": "PIX",
    "conta_origem": "123456",
    "conta_destino": "usuario@email.com",
    "valor": 100.50,
    "data_hora": "2026-01-20T14:30:00Z",
    "id_transacao": "PIX_TEST_001"
  }' \
  -o /tmp/comprovante_pix_test.pdf -w "%{http_code}")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Comprovante PIX gerado com sucesso"
    ((PASS_COUNT++))
    
    # Verifica se o arquivo foi criado
    if [ -f /tmp/comprovante_pix_test.pdf ]; then
        SIZE=$(stat -f%z /tmp/comprovante_pix_test.pdf 2>/dev/null || stat -c%s /tmp/comprovante_pix_test.pdf)
        echo -e "  📄 Arquivo gerado: /tmp/comprovante_pix_test.pdf (${SIZE} bytes)"
        
        # Verifica se é um PDF válido
        if file /tmp/comprovante_pix_test.pdf | grep -q "PDF"; then
            echo -e "${GREEN}✓${NC} Arquivo é um PDF válido"
            ((PASS_COUNT++))
        else
            echo -e "${RED}✗${NC} Arquivo não é um PDF válido"
            ((FAIL_COUNT++))
        fi
    else
        echo -e "${RED}✗${NC} Arquivo não foi criado"
        ((FAIL_COUNT++))
    fi
else
    echo -e "${RED}✗${NC} Erro ao gerar comprovante PIX (HTTP $RESPONSE)"
    ((FAIL_COUNT++))
fi

echo ""
echo "3️⃣  Testando geração de comprovante TED..."
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST "$GATEWAY_URL/comprovantes/gerar" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_transacao": "TED",
    "conta_origem": "190612",
    "conta_destino": "987654",
    "valor": 250.00,
    "data_hora": "2026-01-20T15:45:00Z",
    "id_transacao": "TED_TEST_001"
  }' \
  -o /tmp/comprovante_ted_test.pdf -w "%{http_code}")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Comprovante TED gerado com sucesso"
    ((PASS_COUNT++))
    
    if [ -f /tmp/comprovante_ted_test.pdf ]; then
        SIZE=$(stat -f%z /tmp/comprovante_ted_test.pdf 2>/dev/null || stat -c%s /tmp/comprovante_ted_test.pdf)
        echo -e "  📄 Arquivo gerado: /tmp/comprovante_ted_test.pdf (${SIZE} bytes)"
        
        if file /tmp/comprovante_ted_test.pdf | grep -q "PDF"; then
            echo -e "${GREEN}✓${NC} Arquivo é um PDF válido"
            ((PASS_COUNT++))
        else
            echo -e "${RED}✗${NC} Arquivo não é um PDF válido"
            ((FAIL_COUNT++))
        fi
    else
        echo -e "${RED}✗${NC} Arquivo não foi criado"
        ((FAIL_COUNT++))
    fi
else
    echo -e "${RED}✗${NC} Erro ao gerar comprovante TED (HTTP $RESPONSE)"
    ((FAIL_COUNT++))
fi

echo ""
echo "4️⃣  Verificando logs do servidor gRPC..."
echo "------------------------------------------"

if docker ps | grep -q container_comprovantes; then
    echo -e "${GREEN}✓${NC} Container do serviço gRPC está rodando"
    ((PASS_COUNT++))
    
    echo ""
    echo "Últimas linhas do log:"
    docker logs --tail 5 container_comprovantes 2>/dev/null || echo "Não foi possível acessar os logs"
else
    echo -e "${RED}✗${NC} Container do serviço gRPC não está rodando"
    ((FAIL_COUNT++))
fi

echo ""
echo "5️⃣  Verificando logs do cliente gRPC (Gateway)..."
echo "---------------------------------------------------"

if docker ps | grep -q container_gateway; then
    echo -e "${GREEN}✓${NC} Container do Gateway está rodando"
    ((PASS_COUNT++))
    
    echo ""
    echo "Últimas linhas do log:"
    docker logs --tail 5 container_gateway 2>/dev/null | grep -E "(gRPC|Comprovante)" || echo "Nenhum log relevante encontrado"
else
    echo -e "${RED}✗${NC} Container do Gateway não está rodando"
    ((FAIL_COUNT++))
fi

echo ""
echo "======================================"
echo "📊 RESUMO DOS TESTES"
echo "======================================"
echo -e "${GREEN}✓ Testes aprovados: $PASS_COUNT${NC}"
echo -e "${RED}✗ Testes falhados: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    echo ""
    echo "✅ A comunicação gRPC está funcionando corretamente"
    echo "✅ PDFs estão sendo gerados via Python"
    echo "✅ Cliente TypeScript está se comunicando com servidor Python"
    echo ""
    echo "📄 Arquivos de teste gerados:"
    echo "   - /tmp/comprovante_pix_test.pdf"
    echo "   - /tmp/comprovante_ted_test.pdf"
    echo ""
    echo "Para visualizar os PDFs:"
    echo "   xdg-open /tmp/comprovante_pix_test.pdf  # Linux"
    echo "   open /tmp/comprovante_pix_test.pdf      # macOS"
    exit 0
else
    echo -e "${RED}❌ Alguns testes falharam${NC}"
    echo ""
    echo "💡 Dicas para resolver:"
    echo "   1. Verifique se todos os containers estão rodando: docker ps"
    echo "   2. Reinicie os serviços: docker-compose restart"
    echo "   3. Veja os logs: docker logs container_comprovantes"
    echo "   4. Consulte INSTALACAO_GRPC.md para troubleshooting"
    exit 1
fi
