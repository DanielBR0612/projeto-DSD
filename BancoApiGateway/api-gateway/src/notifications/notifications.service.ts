import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(private readonly httpService: HttpService) {}

  async notificarTransacao(dados: any) {
    const url = 'http://localhost:8083/notify'; 

    const payload = {
      destinatarioId: String(dados.contaDestino || dados.conta),
      valor: dados.valor,
      tipo: dados.tipo || 'TRANSFERENCIA',
      data: new Date()
    };

    console.log(`[NOTIFICAÇÃO] Enviando aviso para ${url}...`);

    try {
      await firstValueFrom(this.httpService.post(url, payload));
      
      console.log('✅ Notificação entregue ao serviço WebSocket!');
    } catch (error) {
      console.error('⚠️ Falha ao notificar (O serviço WebSocket pode estar offline):', error.message);
    }
  }
}