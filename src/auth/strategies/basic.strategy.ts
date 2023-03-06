import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthConfigService } from '../auth-config.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly authConfigService: AuthConfigService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<true | never> {
    //TODO Потом сделать так что бы константы закидывались в конструктор что бы класс был тестируемый и подменяемый. или же в тестах теже самые константы использовать)))
    if (
      username !== this.authConfigService.getAdminBasicAuthLogin ||
      password !== this.authConfigService.getAdminBasicAuthPassword
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
