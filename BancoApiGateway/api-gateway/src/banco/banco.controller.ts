import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BancoCoreSoapService } from '../banco-core-soap/banco-core-soap.service';
import { BancoRestApiService } from '../banco-rest-api/banco-rest-api.service';

@Controller('banco')
export class BancoController {
  constructor(
    private readonly soapService: BancoCoreSoapService,
    private readonly restService: BancoRestApiService,
  ) {}

  @Get('saldo')
  async getSaldo(@Query('tipo') tipo: string) {
    if (tipo === 'soap') {
      return await this.soapService.chamarServico('getSaldo', {/* dados */});
    } else {
      return await this.restService.get('saldo');
    }
  }

  @Post('pix')
  async criarPix(@Body() body: any, @Query('tipo') tipo: string) {
    if (tipo === 'soap') {
      return await this.soapService.chamarServico('criarPix', body);
    } else {
      return await this.restService.post('pix', body);
    }
  }
}

