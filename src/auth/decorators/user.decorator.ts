import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!data) return user;

    if (user && typeof user === 'object') {
      const dict = user as Record<string, unknown>;
      return dict[data];
    }

    return undefined;
  },
);
