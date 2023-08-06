import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ContextUtil } from '../utils/context.util';

export const Request = createParamDecorator(
  (data, context: ExecutionContext) => {
    return ContextUtil.getRequest(context);
  }
);
