import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';
import { UsersFactory } from '../../users/users.factory';
import { EmailSenderService } from '../../global-services/email-sender.service';
import { ConfirmRegistrationDto } from '../api/dto/confirmRegistration.dto';
import { UnprocessableEntityException } from '../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UserDocument } from '../../users/users-schema';
import { ResendRegistrationEmailDto } from '../api/dto/resendRegistrationEmail.dto';
import * as bcrypt from 'bcrypt';
import { InvalidValueException } from '../../common/exceptions/domain.exceptions/invalid-value-exception';
import { DomainException } from '../../common/exceptions/domain.exceptions/domain.exception';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserSessionsFactory } from '../../security/user-sessions.factory';
import { UserSessionsService } from '../../security/user-sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private emailSenderService: EmailSenderService,
    private jwtService: JwtService,
    private userSessionsFactory: UserSessionsFactory,
    private userSessionsService: UserSessionsService,
  ) {}

  public async confirmRegistration(dto: ConfirmRegistrationDto) {
    try {
      const user = await this.usersRepository.getByConfirmationCode(dto.code);
      if (user.isUserConfirmed()) throw new DomainException('');

      user.confirmRegistration();
      await this.usersRepository.save(user);
    } catch (e) {
      throw new UnprocessableEntityException(
        'The confirmation code is incorrect',
        'code',
      );
    }
  }

  public async resendRegistrationEmail(dto: ResendRegistrationEmailDto) {
    const user = await this.usersRepository.getByEmail(dto.email);
    if (user.isUserConfirmed()) {
      throw new UnprocessableEntityException(
        'The email is already confirmed',
        'email',
      );
    }
    // if (process.env.NODE_ENV !== 'test') {
    user.generateEmailConfirmationInfo();
    await this.emailSenderService.sendRegistrationConfirmationEmail(
      user.email,
      user.emailConfirmationInfo.confirmationCode,
    );
    // }
    await this.usersRepository.save(user);
  }

  public async login(
    user: UserDocument,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateJwtAccessToken(user._id.toString());
    const refreshToken = this.generateJwtRefreshToken(user._id.toString());

    await this.userSessionsFactory.createNewUserSession(
      refreshToken,
      ip,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
    ip: string,
    userAgent: string,
  ) {
    const accessToken = this.generateJwtAccessToken(refreshTokenPayload.userId);
    const refreshToken = this.generateJwtRefreshToken(
      refreshTokenPayload.userId,
      refreshTokenPayload.deviceId,
    );

    await this.userSessionsService.updateSessionByDeviceId(
      refreshTokenPayload.deviceId,
      refreshToken,
      ip,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async comparePasswordWithHash(password, passwordHash) {
    const result = await bcrypt.compare(password, passwordHash);
    if (!result) {
      throw new InvalidValueException(
        'Incorrect username or password. Please try again.',
      );
    }
  }

  public async checkUserCredentials(loginOrEmail: string, password: string) {
    try {
      const user = await this.usersRepository.getByLoginOrEmail(loginOrEmail);
      if (!user.isActive) throw new DomainException('User is not active');
      await this.comparePasswordWithHash(password, user.passwordHash);
      return user;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  private generateJwtAccessToken(userId: string) {
    return this.jwtService.sign({ userId });
  }

  private generateJwtRefreshToken(userId: string, deviceId: string = uuidv4()) {
    return this.jwtService.sign(
      { userId: userId, deviceId: deviceId },
      { expiresIn: '20m' },
    );
  }
}