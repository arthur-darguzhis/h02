import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../../users/users-schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginOrEmail', // specify the new field here
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.authService.checkUserCredentials(
      loginOrEmail,
      password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
