import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UserSessionsRepository } from '../../../security/infrastructure/user-sessions.repository';

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
    private userSessionsPgRepository: UserSessionsRepository,
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

    const userSession = await this.userSessionsPgRepository.getByDeviceId(
      command.refreshTokenPayload.deviceId,
    );

    const decodedRefreshToken: any = this.jwtService.decode(refreshToken, {
      json: true,
    });

    userSession.issuedAt = decodedRefreshToken.iat;
    userSession.expireAt = decodedRefreshToken.exp;
    userSession.deviceName = command.userAgent ?? 'unknown';
    userSession.ip = command.ip;

    await this.userSessionsPgRepository.save(userSession);

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
