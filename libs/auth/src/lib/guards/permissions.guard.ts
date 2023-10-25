import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '@nx-nestjs-prisma-template/data-layer';
import { ContextUtil, PermissionEnum } from '@nx-nestjs-prisma-template/shared';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionEnum[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) return true;

    const requestUser = ContextUtil.getRequest(context).user;
    if (!requestUser) return false;

    const permissions = await this.usersService.getUserPermissions(
      requestUser.id,
    );

    return requiredPermissions.some((permission) =>
      permissions.includes(permission.toString()),
    );
  }
}
