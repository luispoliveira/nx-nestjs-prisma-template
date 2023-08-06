import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ContextUtil } from '@nx-nestjs-prisma-template/shared';
import { UserValidate } from '../types/user.type';

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext): UserValidate => {
    const request = ContextUtil.getRequest(context);
    return request.user;
  },
);
