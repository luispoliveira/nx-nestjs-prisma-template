import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionsGuard,
} from '@nx-nestjs-prisma-template/auth';
import { LoggerInterceptor } from './logger.interceptor';

@UseInterceptors(LoggerInterceptor)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LocalBaseAuthController {}
