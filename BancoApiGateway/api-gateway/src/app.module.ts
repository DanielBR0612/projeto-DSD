import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BancoCoreSoapModule } from './banco-core-soap/banco-core-soap.module';
import { BancoRestApiModule } from './banco-rest-api/banco-rest-api.module';
import { BancoSoapController } from './banco/banco-soap.controller';
import { BancoRestController } from './banco/banco-rest.controller';

import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { QueueService } from './queue/queue.service';
import { ComprovantesGrpcModule } from './comprovantes-grpc/comprovantes-grpc.module';
import { ComprovantesModule } from './comprovantes/comprovantes.module';

@Module({
  imports: [BancoCoreSoapModule, BancoRestApiModule, NotificationsModule, AuthModule, ComprovantesGrpcModule, ComprovantesModule],
  controllers: [AppController, BancoSoapController, BancoRestController,  AuthController],
  providers: [AppService, QueueService],
})
export class AppModule {}
