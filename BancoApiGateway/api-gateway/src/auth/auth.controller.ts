import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Realiza login e retorna Token JWT' })
  @ApiBody({ schema: { example: { conta: '190612', senha: '123456' } } })
  async login(@Body() body: any) {
    return this.authService.login(body.conta, body.senha);
  }
}