import { UseInterceptors } from '@nestjs/common';
import { BasePublicResolver } from '@nx-nestjs-prisma-template/graphql';
import { LoggerInterceptor } from './logger.interceptor';

@UseInterceptors(LoggerInterceptor)
export class LocalBasePublicResolver extends BasePublicResolver {}
