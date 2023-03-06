import { Injectable } from '@nestjs/common';
import { ConfigType } from '../configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService<ConfigType>) {}

  get getAdminBasicAuthLogin(): string {
    return this.configService.get('LOGIN_FOR_ADMIN_BASIC_AUTH');
  }

  get getAdminBasicAuthPassword(): string {
    return this.configService.get('PASSWORD_FOR_ADMIN_BASIC_AUTH');
  }

  get getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }
}
