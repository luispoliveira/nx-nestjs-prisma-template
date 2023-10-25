import { Injectable } from '@nestjs/common';
import { PermissionsService } from '@nx-nestjs-prisma-template/data-layer';

@Injectable()
export class RbacService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async userHasPermissions(
    userId: number,
    permissionName: string[],
  ): Promise<boolean> {
    const permission = await this.permissionsService.findFirst({
      where: {
        name: {
          in: permissionName,
        },
        Permissions2Users: {
          some: {
            userId: userId,
            isActive: true,
          },
        },
      },
    });

    return !!permission;
  }
}
