FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o arquivo .proto e gera os stubs Python
COPY comprovante.proto .
RUN python -m grpc_tools.protoc \
    -I. \
    --python_out=. \
    --grpc_python_out=. \
    comprovante.proto

# Copia o código do servidor
COPY server.py .

# Expõe a porta do gRPC
EXPOSE 50051

# Comando para iniciar o servidor
CMD ["python", "server.py"]
