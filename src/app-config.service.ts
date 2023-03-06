import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<ConfigType>) {}

  get getAppHost(): string {
    return this.configService.get('APP_HOST');
  }

  get getGmailLogin(): string {
    return this.configService.get('GMAIL_APP_LOGIN');
  }

  get getGmailPassword(): string {
    return this.configService.get('GMAIL_APP_PASSWORD');
  }

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV');
  }
}
