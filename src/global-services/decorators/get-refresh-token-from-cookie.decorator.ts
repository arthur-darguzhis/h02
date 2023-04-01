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

//TODO возможно удалить возможно использовать вместо этого декоратора сделал guard он покрасивше получился
// export const CurrentUserIdFromRefreshToken = createParamDecorator(
//   (data: unknown, context: ExecutionContext) => {
//     const request: Request = context.switchToHttp().getRequest();
//     if (!request.cookies?.refreshToken || request.cookies.refreshToken === '') {
//       throw new UnauthorizedException();
//     }
//
//     const token = request.cookies.refreshToken;
//     try {
//       jwt.verify(token, process.env.JWT_SECRET);
//       const decodedToken = jwt.decode(token, { json: true });
//       return decodedToken.userId;
//     } catch (e) {
//       throw new UnauthorizedException();
//     }
//   },
// );
