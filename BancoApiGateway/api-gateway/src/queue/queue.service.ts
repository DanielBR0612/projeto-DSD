import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class QueueService implements OnModuleInit {
  private channel: amqp.Channel;
  private connection;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      const connection = await amqp.connect(rabbitUrl);
      this.connection = connection;
      this.channel = await connection.createChannel();

      await this.channel.assertQueue('notificacoes.transferencias', {
        durable: true,
      });

      console.log('[Queue Service] Conectado ao RabbitMQ');
    } catch (error) {
      console.error('[Queue Service] Erro de conexão:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publishNotification(notification: {
    destinatarioId: string;
    valor: number;
    tipo: string;
  }) {
    if (!this.channel) {
      console.warn('[Queue Service] Canal não pronto');
      return;
    }

    try {
      const message = {
        ...notification,
        timestamp: new Date().toISOString(),
      };

      this.channel.sendToQueue('notificacoes.transferencias', Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });

      console.log(`[Queue Service] Notificação publicada: ${notification.destinatarioId}`);
    } catch (error) {
      console.error('[Queue Service] Erro ao publicar:', error);
    }
  }
}
