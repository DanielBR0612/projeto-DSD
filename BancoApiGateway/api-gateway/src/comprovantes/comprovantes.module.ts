import { Module } from '@nestjs/common';
import { ComprovantesController } from './comprovantes.controller';
import { ComprovantesGrpcModule } from '../comprovantes-grpc/comprovantes-grpc.module';

@Module({
  imports: [ComprovantesGrpcModule],
  controllers: [ComprovantesController],
})
export class ComprovantesModule {}
