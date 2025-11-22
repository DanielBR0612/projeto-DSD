import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { BancoCoreSoapService } from '../banco-core-soap/banco-core-soap.service';
import { BancoRestApiService } from '../banco-rest-api/banco-rest-api.service';

@Controller('banco')
export class BancoController {
  constructor(
    private readonly soapService: BancoCoreSoapService,
    private readonly restService: BancoRestApiService,
  ) {}

  @Get('saldo')
  async getSaldo(@Query('conta') conta: string, @Query('tipo') tipo: string) {
    if (!conta) {
       throw new BadRequestException('O parâmetro "conta" é obrigatório.');
    }

    if (tipo === 'soap') {
  
      return await this.soapService.chamarServico('consultarSaldo', { numeroConta: conta });
    } else {

      return await this.restService.get(`extrato/${conta}`);
    }
  }

  @Post('pix')
  async criarPix(@Body() body: any, @Query('tipo') tipo: string) {
    if (tipo === 'soap') {

      return await this.soapService.chamarServico('realizarTransferenciaTED', body);
    } else {
  
      return await this.restService.post('pix/transferir', body);
    }
  }
}

