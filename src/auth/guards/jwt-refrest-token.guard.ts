import { AuthGuard } from '@nestjs/passport';

export class JwtRefreshTokenGuard extends AuthGuard('refresh-token') {}
