import { Module } from '@nestjs/common';
import { BancoRestApiService } from './banco-rest-api.service';

@Module({
  providers: [BancoRestApiService],
  exports: [BancoRestApiService]
})
export class BancoRestApiModule {}
