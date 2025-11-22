import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { BancoCoreSoapService } from '../banco-core-soap/banco-core-soap.service';

@Controller('banco')
export class BancoSoapController {
  constructor(
    private readonly soapService: BancoCoreSoapService,
  ) {}

  @Get('saldo')
  async getSaldo(@Query('conta') conta: string) {
    if (!conta) {
       throw new BadRequestException('O parâmetro "conta" é obrigatório.');
    }
      return await this.soapService.chamarServico('consultarSaldo', { numeroConta: conta });
  }

  @Post('TED')
  async realizarTED(@Body() body: any) {
    return await this.soapService.chamarServico('realizarTransferenciaTED', body)
  }
  }


