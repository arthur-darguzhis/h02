import { Module } from '@nestjs/common';
import { EmailSenderService } from './email-sender.service';
import { AppConfigService } from '../app-config.service';

@Module({
  providers: [EmailSenderService, AppConfigService],
})
export class GlobalServicesModule {}
