import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PasswordUtil, RoleEnum } from '@nx-nestjs-prisma-template/shared';
import { Prisma } from '@prisma/client';
@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  private defaultInclude = {
    Roles2Users: {
      include: {
        role: {
          include: {
            Permissions2Roles: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
    Permissions2Users: {
      include: {
        permission: true,
      },
    },
  };

  private adminUser?: {
    email: string;
    password: string;
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.adminUser = this.configService.get<{
      email: string;
      password: string;
    }>('admin');
  }

  async ensureAdminUser() {
    if (!this.adminUser) throw new Error('Admin user not found');

    const user = await this.findFirst({
      where: {
        email: {
          equals: this.adminUser.email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      await this.create({
        data: {
          email: this.adminUser.email,
          password: await PasswordUtil.hash(this.adminUser.password),
          isActive: true,
          Roles2Users: {
            create: {
              role: {
                connect: {
                  name: RoleEnum.Admin,
                },
              },
            },
          },
        },
      });
      this.logger.log('Admin user created');
      return;
    }

    this.logger.log('Admin user already exists');
  }

  async create(args: Prisma.UserCreateArgs) {
    try {
      return await this.prismaService.user.create(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async update(args: Prisma.UserUpdateArgs) {
    try {
      return await this.prismaService.user.update(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findUnique(args: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      ...args,
      include: this.defaultInclude,
    });
  }

  async findFirst(args: Prisma.UserFindFirstArgs) {
    return await this.prismaService.user.findFirst({
      ...args,
      include: this.defaultInclude,
    });
  }

  async findMany(args: Prisma.UserFindManyArgs) {
    return await this.prismaService.user.findMany({
      ...args,
      include: this.defaultInclude,
    });
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const roles = await this.prismaService.role.findMany({
      where: {
        isActive: true,
        Roles2Users: {
          some: {
            userId: userId,
            isActive: true,
          },
        },
      },
    });

    return roles.map((r) => r.name);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const allPermissions: string[] = [];

    const permissions = await this.prismaService.permission.findMany({
      where: {
        Permissions2Users: {
          some: {
            userId: userId,
            isActive: true,
          },
        },
      },
    });
    for (const permission of permissions) {
      if (!allPermissions.includes(permission.name))
        allPermissions.push(permission.name);
    }

    const roles = await this.prismaService.role.findMany({
      where: {
        isActive: true,
        Roles2Users: {
          some: {
            userId: userId,
            isActive: true,
          },
        },
      },
      include: {
        Permissions2Roles: {
          where: {
            isActive: true,
          },
          include: {
            permission: true,
          },
        },
      },
    });

    for (const role of roles) {
      const permissions2Roles = role.Permissions2Roles;
      for (const permission2Role of permissions2Roles) {
        if (!allPermissions.includes(permission2Role.permission.name))
          allPermissions.push(permission2Role.permission.name);
      }
    }

    return allPermissions;
  }
}
