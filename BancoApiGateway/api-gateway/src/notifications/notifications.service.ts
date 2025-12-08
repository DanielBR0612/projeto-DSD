import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly queueService: QueueService,
  ) {}

  async notificarTransacao(dados: any) {
    const { contaDestino, valor, tipo } = dados;
    const url = 'http://ws-service:8083/notify'; 

    console.log(`[NOTIFICAÇÃO] Enfileirando para ${contaDestino}: R$ ${valor}`);

    // Publica na fila RabbitMQ
    await this.queueService.publishNotification({
      contaDestino,
      valor,
      tipo,
    });

    // Tenta entregar via WebSocket (rota alternativa rápida)
    try {
      await this.httpService
        .post(`http://localhost:8083/notify`, { contaDestino, valor, tipo })
        .toPromise();
      console.log('✅ Notificação enviada via WebSocket');
    } catch (error) {
      console.log('⚠️ Cliente WebSocket offline - notificação aguardando na fila');
    }
  }
}
