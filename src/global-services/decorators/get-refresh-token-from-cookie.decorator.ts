import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwt from 'jsonwebtoken';

export const RefreshTokenPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.refreshToken;
    const decodedToken = jwt.decode(token, { json: true });
    return {
      userId: decodedToken.userId,
      deviceId: decodedToken.deviceId,
    };
  },
);
