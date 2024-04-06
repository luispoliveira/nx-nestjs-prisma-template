import { UseInterceptors } from '@nestjs/common';
import { BaseAuthResolver } from '@nx-nestjs-prisma-template/graphql';
import { LoggerInterceptor } from './logger.interceptor';

@UseInterceptors(LoggerInterceptor)
export class LocalBaseAuthResolver extends BaseAuthResolver {}
