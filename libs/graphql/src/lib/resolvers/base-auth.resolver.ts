import { UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionsGuard,
} from '@nx-nestjs-prisma-template/auth';

@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BaseAuthResolver {}
