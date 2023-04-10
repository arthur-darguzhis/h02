import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthConfigService } from '../auth-config.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authConfigService: AuthConfigService) {
    super();
  }

  async validate(username: string, password: string): Promise<true | never> {
    if (
      username !== this.authConfigService.getAdminBasicAuthLogin ||
      password !== this.authConfigService.getAdminBasicAuthPassword
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
