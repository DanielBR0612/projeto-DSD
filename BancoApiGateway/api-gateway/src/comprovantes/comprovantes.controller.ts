import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ComprovantesGrpcService } from '../comprovantes-grpc/comprovantes-grpc.service';

@ApiTags('comprovantes')
@Controller('comprovantes')
export class ComprovantesController {
  private readonly logger = new Logger(ComprovantesController.name);

  constructor(
    private readonly comprovantesGrpcService: ComprovantesGrpcService,
  ) {}

  @Post('gerar')
  @ApiOperation({ summary: 'Gera comprovante de transação em PDF via gRPC' })
  @ApiBody({
    schema: {
      example: {
        tipo_transacao: 'PIX',
        conta_origem: '123456',
        conta_destino: 'usuario@email.com',
        valor: 100.50,
        data_hora: '2026-01-20T14:30:00Z',
        id_transacao: 'txn_abc123',
      },
    },
  })
  async gerarComprovante(@Body() body: any, @Res() res: Response) {
    try {
      this.logger.log(`📄 Requisição para gerar comprovante ${body.tipo_transacao}`);

      // Chama o serviço gRPC para gerar o PDF
      const resultado = await this.comprovantesGrpcService.gerarComprovante({
        tipo_transacao: body.tipo_transacao || 'PIX',
        conta_origem: String(body.conta_origem),
        conta_destino: String(body.conta_destino),
        valor: Number(body.valor),
        data_hora: body.data_hora || new Date().toISOString(),
        id_transacao: body.id_transacao || `txn_${Date.now()}`,
      });

      // Retorna o PDF como download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resultado.filename}"`,
        'Content-Length': resultado.pdf_data.length,
      });

      this.logger.log(`✅ Comprovante enviado: ${resultado.filename}`);
      return res.send(resultado.pdf_data);

    } catch (error) {
      this.logger.error(`❌ Erro ao gerar comprovante: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Erro ao gerar comprovante: ${error.message}`,
      });
    }
  }
}
