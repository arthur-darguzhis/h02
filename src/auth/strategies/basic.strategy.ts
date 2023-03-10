import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<true | never> {
    //TODO Потом сделать так что бы константы закидывались в конструктор что бы класс был тестируемый и подменяемый. или же в тестах теже самые константы использовать)))
    if (
      username !== process.env.LOGIN_FOR_ADMIN_BASIC_AUTH ||
      password !== process.env.PASSWORD_FOR_ADMIN_BASIC_AUTH
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
