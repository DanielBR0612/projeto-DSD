import { Controller, Get, Post, Body } from '@nestjs/common';
import { AtmService } from './atm.service';

@Controller('atms')
export class AtmController {

  constructor(private readonly atmService: AtmService) {}

  @Get()
  async getAtms() {
    return this.atmService.listarTodos();
  }

  @Post('block')
  async blockAtm(@Body() body: { id: string }) {
    return this.atmService.bloquear(body.id);
  }

  @Post('refill')
  async abastecerAtm(@Body() body: { id: string, amount: number }) {
    return this.atmService.abastecer(body.id, body.amount);
}
}