import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BancoCoreSoapModule } from './banco-core-soap/banco-core-soap.module';
import { BancoRestApiModule } from './banco-rest-api/banco-rest-api.module';
import { BancoController } from './banco/banco.controller';

@Module({
  imports: [BancoCoreSoapModule, BancoRestApiModule],
  controllers: [AppController, BancoController],
  providers: [AppService],
})
export class AppModule {}
