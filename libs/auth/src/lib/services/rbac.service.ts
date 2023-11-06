import { Injectable } from '@nestjs/common';
import { UsersService } from '@nx-nestjs-prisma-template/data-layer';

@Injectable()
export class RbacService {
  constructor(private readonly usersService: UsersService) {}

  async userHasPermissions(
    userId: number,
    permissionName: string[],
  ): Promise<boolean> {
    const permissions = await this.usersService.getUserPermissions(userId);

    return permissions.some((permission) =>
      permissionName.includes(permission),
    );
  }
}
