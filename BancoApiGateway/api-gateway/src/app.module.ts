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

@Module({
  imports: [BancoCoreSoapModule, BancoRestApiModule, NotificationsModule, AuthModule],
  controllers: [AppController, BancoSoapController, BancoRestController,  AuthController],
  providers: [AppService],
})
export class AppModule {}
