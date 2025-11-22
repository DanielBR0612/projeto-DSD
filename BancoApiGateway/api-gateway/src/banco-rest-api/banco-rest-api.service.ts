import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BancoRestApiService {
  private baseUrl = 'http://localhost:8081'; 
  
  private async get(endpoint: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${endpoint}`);
      return response.data;
    } catch (error) {
      this.tratarErro(error);
    }
  }

  private async post(endpoint: string, data: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/${endpoint}`, data);
      return response.data;
    } catch (error) {
      this.tratarErro(error);
    }
  }

  async criarChavePix(clienteId: number, dadosPix: any) {
    const endpoint = `clientes/${clienteId}/chaves-pix`;
    return this.post(endpoint, dadosPix);
  }

  async realizarPix(dadosPix) {
    const endpoint = `pix/transferir`;

    return this.post(endpoint, dadosPix)
  }

  async getChavesPix(numeroConta: string) {
    const endpoint = `clientes/${numeroConta}/chaves-pix`;
    return this.get(endpoint);
  }

  async getExtrato(numeroConta: string) {
    const endpoint = `extrato/${numeroConta}`;
    return this.get(endpoint);
  }

  private tratarErro(error: any) {
    console.error('Erro na chamada REST:', error.message);
    if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
    }
    throw new HttpException('Serviço REST indisponível', HttpStatus.BAD_GATEWAY);
  }
}