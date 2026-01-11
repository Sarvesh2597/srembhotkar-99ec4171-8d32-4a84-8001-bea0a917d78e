import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserPayload } from '@task-management/data';

export const CurrentUser = createParamDecorator(
  (data: keyof IUserPayload | undefined, ctx: ExecutionContext): IUserPayload | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IUserPayload;

    if (data) {
      return user[data];
    }

    return user;
  },
);
