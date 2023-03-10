import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegistrationDto } from './dto/registration.dto';
import { UsersRepository } from '../users/users.repository';
import { UsersFactory } from '../users/users.factory';
import { EmailSenderService } from '../global-services/email-sender.service';
import { ConfirmRegistrationDto } from './dto/confirmRegistration.dto';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UserDocument } from '../users/users-schema';
import { ResendRegistrationEmailDto } from './dto/resendRegistrationEmail.dto';
import * as bcrypt from 'bcrypt';
import { InvalidValueException } from '../common/exceptions/domain.exceptions/invalid-value-exception';
import { DomainException } from '../common/exceptions/domain.exceptions/domain.exception';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private emailSenderService: EmailSenderService,
    private jwtService: JwtService,
  ) {}

  public async registration(dto: RegistrationDto): Promise<void | never> {
    const newUser = await this.usersFactory.registerNewUser(dto);
    await this.emailSenderService.sendRegistrationConfirmationEmail(newUser);
  }

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
    user.generateEmailConfirmationInfo();
    await this.emailSenderService.sendRegistrationConfirmationEmail(user);
    await this.usersRepository.save(user);
  }

  public async login(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: this.generateJwtAccessToken(user),
      refreshToken: this.generateJwtRefreshToken(user),
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

  private generateJwtAccessToken(user: UserDocument) {
    return this.jwtService.sign({ userId: user._id.toString() });
  }

  private generateJwtRefreshToken(
    user: UserDocument,
    deviceId: string = uuidv4(),
  ) {
    return this.jwtService.sign(
      { userId: user._id.toString(), deviceId: deviceId },
      { expiresIn: '14d' },
    );
  }
}
