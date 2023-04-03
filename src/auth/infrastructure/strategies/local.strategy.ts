import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../../../users/users-schema';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { DomainException } from '../../../common/exceptions/domain.exceptions/domain.exception';
import * as bcrypt from 'bcrypt';
import { InvalidValueException } from '../../../common/exceptions/domain.exceptions/invalid-value-exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersPgRepository: UsersPgRepository) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.checkUserCredentials(loginOrEmail, password);
    if (!user || user.isBanned) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<any | never> {
    try {
      const user = await this.usersPgRepository.getByLoginOrEmail(loginOrEmail);

      await this.comparePasswordWithHash(password, user.passwordHash);

      if (user && user.confirmationCode && !user.isConfirmed) {
        throw new DomainException('User is not active');
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  private async comparePasswordWithHash(password, passwordHash) {
    const result = await bcrypt.compare(password, passwordHash);
    if (!result) {
      throw new InvalidValueException(
        'Incorrect username or password. Please try again.',
      );
    }
  }
}
