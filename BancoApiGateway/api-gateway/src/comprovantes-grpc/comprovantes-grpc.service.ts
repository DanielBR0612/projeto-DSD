import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

interface ComprovanteRequest {
  tipo_transacao: string;
  conta_origem: string;
  conta_destino: string;
  valor: number;
  data_hora: string;
  id_transacao: string;
}

interface ComprovanteResponse {
  pdf_data: Buffer;
  filename: string;
  success: boolean;
  message: string;
}

@Injectable()
export class ComprovantesGrpcService implements OnModuleInit {
  private readonly logger = new Logger(ComprovantesGrpcService.name);
  private client: any;
  private readonly grpcUrl: string;

  constructor() {
    this.grpcUrl = process.env.GRPC_COMPROVANTES_URL || 'comprovantes-service:50051';
  }

  async onModuleInit() {
    try {
      // Carrega o arquivo .proto
      const PROTO_PATH = join(__dirname, '../../proto/comprovante.proto');
      
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
      const ComprovanteService = protoDescriptor.comprovante.ComprovanteService;

      // Cria o cliente gRPC
      this.client = new ComprovanteService(
        this.grpcUrl,
        grpc.credentials.createInsecure(),
      );

      this.logger.log(`✅ Cliente gRPC conectado ao servidor: ${this.grpcUrl}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao inicializar cliente gRPC: ${error.message}`);
    }
  }

  /**
   * Gera um comprovante de transação em PDF via gRPC
   */
  async gerarComprovante(dados: ComprovanteRequest): Promise<ComprovanteResponse> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Cliente gRPC não inicializado'));
        return;
      }

      this.logger.log(`📄 Solicitando geração de comprovante ${dados.tipo_transacao} via gRPC`);

      this.client.GerarComprovante(dados, (error: any, response: ComprovanteResponse) => {
        if (error) {
          this.logger.error(`❌ Erro na chamada gRPC: ${error.message}`);
          reject(error);
          return;
        }

        if (!response.success) {
          this.logger.warn(`⚠️  Comprovante não gerado: ${response.message}`);
          reject(new Error(response.message));
          return;
        }

        this.logger.log(`✅ Comprovante gerado com sucesso: ${response.filename}`);
        resolve(response);
      });
    });
  }
}
