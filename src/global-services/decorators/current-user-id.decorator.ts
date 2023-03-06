import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import * as process from 'process';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request.user?.userId) {
      throw new Error(
        'JwtAuthGuard in every end-point where decorator @CurrentUserId is used',
      );
    }
    return request.user.userId;
  },
);

export const OptionalCurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.headers.authorization) {
      const token = request.headers.authorization.split(' ')[1];

      try {
        const jwtPayload: any = jwt.verify(token, process.env.JWT_SECRET);
        return jwtPayload.userId;
      } catch (error) {
        return null;
      }
    }
    return null;
  },
);
