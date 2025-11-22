import { Module } from '@nestjs/common';
import { BancoCoreSoapService } from './banco-core-soap.service';

@Module({
  providers: [BancoCoreSoapService],
  exports: [BancoCoreSoapService]
})
export class BancoCoreSoapModule {}
