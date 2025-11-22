import { Injectable } from '@nestjs/common';
import { createClientAsync } from 'strong-soap';

@Injectable()
export class BancoCoreSoapService {
  private wsdlUrl = 'http://localhost:8080/ws/banco.wsdl';

  async chamarServico(acao: string, payload: any): Promise<any> {
    const client = await createClientAsync(this.wsdlUrl);
    return new Promise((resolve, reject) => {
      client[acao](payload, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}
