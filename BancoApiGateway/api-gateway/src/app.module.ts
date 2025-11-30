import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BancoCoreSoapModule } from './banco-core-soap/banco-core-soap.module';
import { BancoRestApiModule } from './banco-rest-api/banco-rest-api.module';
import { BancoSoapController } from './banco/banco-soap.controller';
import { BancoRestController } from './banco/banco-rest.controller';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [BancoCoreSoapModule, BancoRestApiModule, NotificationsModule],
  controllers: [AppController, BancoSoapController, BancoRestController],
  providers: [AppService],
})
export class AppModule {}
