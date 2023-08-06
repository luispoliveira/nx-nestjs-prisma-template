import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '@nx-nestjs-prisma-template/auth';
import {
  PermissionsService,
  RolesService,
  UsersService,
} from '@nx-nestjs-prisma-template/data-layer';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PasswordUtil } from '@nx-nestjs-prisma-template/shared';
import { Login } from './object-types/login.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    });

    if (!user) return null;

    if (user && user.isActive && user.password) {
      if (await PasswordUtil.compare(user.password, password)) {
        const { password, ...result } = user;
        return result;
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    }
    return null;
  }

  async login(user: User): Promise<Login> {
    const roles = await this.rolesService.findMany({
      where: {
        role2user: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
      },
    });

    const permissions = await this.permissionsService.findMany({
      where: {
        permission2user: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
      },
    });

    const mergedPermissions = [
      ...new Set([
        ...permissions.map((p) => p.name),
        ...roles
          .map((r) => r.role2permission)
          .flat()
          .map((rp) => rp.permission.name),
      ]),
    ];

    const payload: JwtPayloadType = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map((r) => r.name),
      permissions: mergedPermissions,
    };

    const jwtSecretKey = this.configService.get<{ access: string }>(
      'jwtSecretKey',
    );

    if (!jwtSecretKey)
      throw new Error('jwtSecretKey is not defined in .env file');

    await this.usersService.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      username: user.username,
      roles: roles.map((r) => r.name),
      permissions: mergedPermissions,
    };
  }
}
