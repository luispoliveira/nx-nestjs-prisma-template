import { SetMetadata } from '@nestjs/common';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
