import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ContextUtil, PermissionEnum } from '@nx-nestjs-prisma-template/shared';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionEnum[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) return true;

    const { permissions } = ContextUtil.getRequest(context).user;

    return requiredPermissions.some((permission) =>
      permissions.includes(permission),
    );
  }
}
