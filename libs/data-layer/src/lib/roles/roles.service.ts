import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Role } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { RoleEnum } from '@nx-nestjs-prisma-template/shared';
import { Prisma } from '@prisma/client';
@Injectable()
export class RolesService {
  private logger = new Logger(RolesService.name);

  private defaultInclude: Prisma.RoleInclude = {
    Permissions2Roles: {
      include: {
        permission: true,
      },
    },
  };

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
      include: this.defaultInclude,
    });
  }

  async findUnique(args: Prisma.RoleFindUniqueArgs): Promise<Role | null> {
    return await this.prismaService.role.findUnique({
      ...args,
      include: this.defaultInclude,
    });
  }

  async create(args: Prisma.RoleCreateArgs): Promise<Role> {
    try {
      return await this.prismaService.role.create(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async update(args: Prisma.RoleUpdateArgs): Promise<Role> {
    try {
      return await this.prismaService.role.update(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
