import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; 
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    HttpModule, 
  ],
  providers: [NotificationsService],
  exports: [NotificationsService], 
})
export class NotificationsModule {}