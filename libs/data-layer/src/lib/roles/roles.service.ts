import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Role } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { RoleEnum } from '@nx-nestjs-prisma-template/shared';
import { Prisma } from '@prisma/client';
@Injectable()
export class RolesService {
  private logger = new Logger(RolesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async ensureRoles() {
    for (const role of Object.values(RoleEnum)) {
      await this.upsert({
        where: {
          name: role,
        },
        create: {
          name: role,
          createdBy: 'system',
          updatedBy: 'system',
        },
        update: {},
      });
    }
  }

  async upsert(args: Prisma.RoleUpsertArgs) {
    try {
      return await this.prismaService.role.upsert(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findMany(args: Prisma.RoleFindManyArgs): Promise<Role[]> {
    return await this.prismaService.role.findMany({
      ...args,
      include: {
        role2permission: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}
