import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UserSessionsPgRepository } from '../../../security/infrastructure/user-sessions-pg.repository';

export class RefreshTokenCommand {
  constructor(
    public readonly refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler {
  constructor(
    private jwtService: JwtService,
    private userSessionsPgRepository: UserSessionsPgRepository,
  ) {}

  async execute(command: RefreshTokenCommand) {
    console.log(command);
    const accessToken = this.generateJwtAccessToken(
      command.refreshTokenPayload.userId,
    );
    const refreshToken = this.generateJwtRefreshToken(
      command.refreshTokenPayload.userId,
      command.refreshTokenPayload.deviceId,
    );

    await this.userSessionsPgRepository.updateSessionByDeviceId(
      command.refreshTokenPayload.deviceId,
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
