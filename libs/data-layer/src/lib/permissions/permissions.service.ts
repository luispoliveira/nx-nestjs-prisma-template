import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { PermissionEnum, RoleEnum } from '@nx-nestjs-prisma-template/shared';
import { Prisma } from '@prisma/client';
@Injectable()
export class PermissionsService {
  private logger = new Logger(PermissionsService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async ensurePermissions() {
    for (const permission of Object.values(PermissionEnum)) {
      const module = permission.split('_')[0];
      await this.upsert({
        where: {
          name: permission,
        },
        create: {
          name: permission,
          module: module,
          Permissions2Roles: {
            create: {
              role: {
                connect: {
                  name: RoleEnum.Admin,
                },
              },
            },
          },
          createdBy: 'system',
          updatedBy: 'system',
        },
        update: {},
      });
    }
  }

  async upsert(args: Prisma.PermissionUpsertArgs) {
    try {
      return await this.prismaService.permission.upsert(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findMany(args: Prisma.PermissionFindManyArgs) {
    return await this.prismaService.permission.findMany(args);
  }

  async findFirst(args: Prisma.PermissionFindFirstArgs) {
    return await this.prismaService.permission.findFirst(args);
  }
}
