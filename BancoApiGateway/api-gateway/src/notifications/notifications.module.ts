import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; 
import { NotificationsService } from './notifications.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    HttpModule, 
    QueueModule
  ],
  providers: [NotificationsService],
  exports: [NotificationsService], 
})
export class NotificationsModule {}