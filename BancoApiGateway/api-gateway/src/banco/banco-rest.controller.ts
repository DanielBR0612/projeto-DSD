import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { BancoRestApiService } from '../banco-rest-api/banco-rest-api.service';

@Controller('banco')
export class BancoRestController {
  constructor(
    private readonly restService: BancoRestApiService,
  ) {}

    @Post('clientes/:id/chaves-pix') 
    async criarChavePix(
    @Param('id') id: number, 
    @Body() body: any
    ) {
    return await this.restService.criarChavePix(id, body);
    }
 
    @Post('pix')
    async realizarPix(@Body() body: any) {
        return await this.restService.realizarPix(body);
    }
  }


