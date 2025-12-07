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
    const { destinatarioId, valor, tipo } = dados;

    console.log(`[NOTIFICAÇÃO] Enfileirando para ${destinatarioId}: R$ ${valor}`);

    // Publica na fila RabbitMQ
    await this.queueService.publishNotification({
      destinatarioId,
      valor,
      tipo,
    });

    // Tenta entregar via WebSocket (rota alternativa rápida)
    try {
      await this.httpService
        .post(`http://localhost:8083/notify`, { destinatarioId, valor, tipo })
        .toPromise();
      console.log('✅ Notificação enviada via WebSocket');
    } catch (error) {
      console.log('⚠️ Cliente WebSocket offline - notificação aguardando na fila');
    }
  }
}
