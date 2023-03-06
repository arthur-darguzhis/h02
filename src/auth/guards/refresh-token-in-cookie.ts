import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UserSessionsRepository } from '../../security/user-sessions.repository';
import { AuthConfigService } from '../auth-config.service';

@Injectable()
export class RefreshTokenInCookieGuard implements CanActivate {
  constructor(
    private readonly userSessionsRepository: UserSessionsRepository,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      !request.cookies ||
      !request.cookies.refreshToken ||
      request.cookies.refreshToken === ''
    ) {
      throw new UnauthorizedException();
    }

    try {
      jwt.verify(
        request.cookies.refreshToken,
        this.authConfigService.getJwtSecret,
      );
    } catch (e) {
      throw new UnauthorizedException('refresh JWT is invalid');
    }

    const decodedToken = jwt.decode(request.cookies.refreshToken, {
      json: true,
    });
    const userSession = await this.userSessionsRepository.findByDeviceId(
      decodedToken.deviceId,
    );
    if (!userSession || userSession.issuedAt !== decodedToken.iat) {
      throw new UnauthorizedException('refresh JWT is invalid');
    }

    return true;
  }
}
