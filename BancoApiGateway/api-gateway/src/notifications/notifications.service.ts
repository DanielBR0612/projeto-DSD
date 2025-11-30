import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private wsServiceUrl = process.env.WS_SERVICE_URL || 'http://localhost:4000';

  async notificarTransacao(destinatarioId: string, valor: number, tipo: 'PIX' | 'TED'): Promise<void> {
    try {
      await axios.post(`${this.wsServiceUrl}/notify`, {
        destinatarioId,
        valor,
        tipo,
      });
    } catch (error) {
      console.error('Erro ao notificar via websocket', error);
      throw new HttpException('Falha ao notificar cliente', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}