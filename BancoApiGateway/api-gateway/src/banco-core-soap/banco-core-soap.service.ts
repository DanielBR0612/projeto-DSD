import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { soap } from 'strong-soap';

@Injectable()
export class BancoCoreSoapService {
  private wsdlUrl: string;
  
  private usuario = 'admin';
  private senha = 'senha123';

  constructor() {
    const soapEnv = process.env.SOAP_URL || 'http://localhost:8081';
    const base = soapEnv.replace(/\/$/, '');
    this.wsdlUrl = `${base}/ws/banco.wsdl`;
  }

  async chamarServico(acao: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      
      const basicAuth = 'Basic ' + Buffer.from(`${this.usuario}:${this.senha}`).toString('base64');
      
      const options = {
        wsdl_headers: { Authorization: basicAuth }
      };

      soap.createClient(this.wsdlUrl, options, (err, client) => {
        if (err) {
            console.error('[SOAP] Erro ao baixar WSDL:', err);
            return reject(new InternalServerErrorException('Erro ao conectar no serviço de banco.'));
        }

        client.addHttpHeader('Authorization', basicAuth);

        const wsSecurity = new soap.WSSecurity(this.usuario, this.senha);
        client.setSecurity(wsSecurity);

        const nomeWrapper = `${acao}Request`;
        
        const args = {
          [nomeWrapper]: {
            ...payload, 
            $attributes: {
               xmlns: 'http://www.example.com/demo/banco'
            }
          }
        };

        console.log(`[SOAP REQUEST] Método: ${acao} | Enviando:`, JSON.stringify(args, null, 2));

        client[acao](args, (err, result, envelope, soapHeader) => { 

          if (err) {
            console.error('[SOAP ERROR]:', err);
            return reject(new InternalServerErrorException('Erro SOAP: ' + err.message));
          }

          if (!result) {
            return reject(new NotFoundException('Conta não encontrada ou retorno vazio do Java.'));
          }
          
          const nomeResponse = `${acao}Response`;
          let dadosFinais = result;

          if (result[nomeResponse]) {
            dadosFinais = result[nomeResponse];
          } else if (result.return) {
            dadosFinais = result.return;
          }

          resolve(dadosFinais);
        });
      });
    });
  }
}