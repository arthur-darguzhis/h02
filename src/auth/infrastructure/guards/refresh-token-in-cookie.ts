import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AuthConfigService } from '../auth-config.service';
import { UserSessionsPgRepository } from '../../../security/user-sessions-pg.repository';

@Injectable()
export class RefreshTokenInCookieGuard implements CanActivate {
  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly userSessionsPgRepository: UserSessionsPgRepository,
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

    const userSession = await this.userSessionsPgRepository.findByDeviceId(
      decodedToken.deviceId,
    );

    if (!userSession || Number(userSession.issuedAt) !== decodedToken.iat) {
      throw new UnauthorizedException('refresh JWT is invalid');
    }

    return true;
  }
}
