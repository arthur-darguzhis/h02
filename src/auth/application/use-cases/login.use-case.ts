import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserSessionsFactory } from '../../../security/user-sessions.factory';

export class LoginCommand {
  constructor(
    public readonly user: any,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler {
  constructor(
    private jwtService: JwtService,
    private userSessionsFactory: UserSessionsFactory,
  ) {}
  async execute(command: LoginCommand) {
    console.log(command);
    const accessToken = this.generateJwtAccessToken(command.user.id);
    const refreshToken = this.generateJwtRefreshToken(command.user.id);

    await this.userSessionsFactory.createNewUserSessionPg(
      refreshToken,
      command.ip,
      command.userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
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
