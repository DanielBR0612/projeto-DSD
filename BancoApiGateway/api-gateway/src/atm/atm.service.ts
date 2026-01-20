import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class AtmService {
  private readonly MONITOR_HOST = process.env.MONITOR_HOST || 'localhost';
  private readonly MONITOR_PORT = 6002;

  async listarTodos() {
    return this.enviarComandoTcp('GET_ALL');
  }

  async bloquear(id: string) {
    return this.enviarComandoTcp(`BLOCK:${id}`);
  }

  async abastecer(id: string, valor: number) {
  return this.enviarComandoTcp(`ABASTECER:${id}:${valor}`);
}

  private enviarComandoTcp(comando: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      
      client.connect(this.MONITOR_PORT, this.MONITOR_HOST, () => {
        client.write(comando);
      });

      client.on('data', (data) => {
        try {
            resolve(JSON.parse(data.toString()));
        } catch {
            resolve({ message: data.toString() });
        }
        client.destroy(); 
      });

      client.on('error', (err) => {
        client.destroy();
        reject(new HttpException('Erro de conexão com Monitor ATM', HttpStatus.BAD_GATEWAY));
      });
      
      client.setTimeout(3000);
      client.on('timeout', () => {
          client.destroy();
          reject(new HttpException('Timeout no Monitor ATM', HttpStatus.GATEWAY_TIMEOUT));
      });
    });
  }
}