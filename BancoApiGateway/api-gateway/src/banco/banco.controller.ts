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
      // SOAP: O método no endpoint Java chama-se 'consultarSaldo'
      // É provável que ele espere um objeto com a propriedade que define o número da conta
      return await this.soapService.chamarServico('consultarSaldo', { numeroConta: conta });
    } else {
      // REST: O endpoint correto é /extrato/{numeroConta}
      return await this.restService.get(`extrato/${conta}`);
    }
  }

  @Post('pix')
  async criarPix(@Body() body: any, @Query('tipo') tipo: string) {
    if (tipo === 'soap') {
      // SOAP: Não existe Pix no serviço SOAP, apenas TED.
      // Redirecionando para 'realizarTransferenciaTED' conforme contrato existente.
      return await this.soapService.chamarServico('realizarTransferenciaTED', body);
    } else {
      // REST: O endpoint correto é /pix/transferir
      return await this.restService.post('pix/transferir', body);
    }
  }
}

