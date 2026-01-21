import { Module } from '@nestjs/common';
import { ComprovantesGrpcService } from './comprovantes-grpc.service';

@Module({
  providers: [ComprovantesGrpcService],
  exports: [ComprovantesGrpcService],
})
export class ComprovantesGrpcModule {}
