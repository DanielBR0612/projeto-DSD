import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BancoCoreSoapService } from '../banco-core-soap/banco-core-soap.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private soapService: BancoCoreSoapService 
  ) {}

  async login(conta: string, senha: string) {
    console.log(`[AUTH] Tentando logar conta: ${conta}...`);

    try {
      const respostaSoap = await this.soapService.chamarServico('autenticar', {
        numeroConta: conta,
        senha: senha
      });

      console.log('[AUTH] Resposta do SOAP:', JSON.stringify(respostaSoap));

      if (respostaSoap && (respostaSoap.valido === true || respostaSoap.valido === 'true')) {
        
        const payload = { 
            sub: conta, 
            username: respostaSoap.nomeCliente || `Cliente ${conta}` 
        };
        
        return {
          access_token: this.jwtService.sign(payload),
          usuario: payload.username
        };
      }
    } catch (error) {
      console.error('[AUTH ERROR] Falha ao comunicar com SOAP:', error.message);
      throw new InternalServerErrorException('Sistema de autenticação indisponível no momento.');
    }
    throw new UnauthorizedException('Conta ou senha inválidos.');
  }
}