import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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
