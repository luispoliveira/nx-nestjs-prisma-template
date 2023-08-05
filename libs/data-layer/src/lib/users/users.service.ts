import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { PasswordUtil, RoleEnum } from '@nx-nestjs-prisma-template/shared';
import { Prisma } from '@prisma/client';
@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  private adminUser?: {
    email: string;
    password: string;
    username: string;
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.adminUser = this.configService.get<{
      email: string;
      password: string;
      username: string;
    }>('admin');
  }

  async ensureAdminUser() {
    if (!this.adminUser) throw new Error('Admin user not found');

    const user = await this.findFirst({
      where: {
        username: {
          equals: this.adminUser.username,
          mode: 'insensitive',
        },
      },
    });

    
    if (!user) {
      await this.create({
        data: {
          username: this.adminUser.username,
          email: this.adminUser.email,
          password: await PasswordUtil.hash(this.adminUser.password),
          user2role: {
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

  async findUnique(args: Prisma.UserFindUniqueArgs) {
    return await this.prismaService.user.findUnique(args);
  }

  async findFirst(args: Prisma.UserFindFirstArgs) {
    return await this.prismaService.user.findFirst(args);
  }
}
