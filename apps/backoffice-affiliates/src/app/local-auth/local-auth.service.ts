import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '@nx-nestjs-prisma-template/auth';
import {
  PermissionsService,
  RolesService,
  UsersService,
} from '@nx-nestjs-prisma-template/data-layer';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PasswordUtil, TokenUtil } from '@nx-nestjs-prisma-template/shared';

@Injectable()
export class LocalAuthService {
  private logger = new Logger(LocalAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const appName = this.configService.get<string>('appName');
    const user = await this.usersService.findFirst({
      where: {
        email: email,
        isActive: true,
        User2Apps: {
          some: {
            app: {
              name: appName,
            },
            isActive: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!(await PasswordUtil.compare(user.password, password)))
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: User) {
    const permissions = await this.usersService.getUserPermissions(user.id);
    const roles = await this.usersService.getUserRoles(user.id);

    const payload: JwtPayloadType = {
      userId: user.id,
      email: user.email,
      permissions,
      roles,
    };

    const jwtSecret = this.configService.get<{ access: string }>(
      'jwtSecretKey',
    );

    if (!jwtSecret) throw new Error('jwtSecretKey not found');

    await this.usersService.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      email: user.email,
      permissions,
      roles,
    };
  }

  async forgetPassword(email: string) {
    const user = await this.usersService.findFirst({
      where: { email: email },
    });

    if (!user) return true;

    await this.usersService.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: false,
        password: null,
        resetPasswordToken: TokenUtil.generate(),
        resetPasswordExpires: TokenUtil.getExpirationDate(1),
        deactivatedAt: new Date(),
      },
    });

    /**
     * send email with reset password link
     */
    return true;
  }

  async recoverPassword(token: string, password: string) {
    const user = await this.usersService.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) return false;

    await this.usersService.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: true,
        password: await PasswordUtil.hash(password),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        deactivatedAt: null,
        activatedAt: new Date(),
      },
    });

    return true;
  }

  async activateAccount(token: string, password: string) {
    const user = await this.usersService.findFirst({
      where: {
        activationToken: token,
        activationTokenExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) return false;

    await this.usersService.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: true,
        password: await PasswordUtil.hash(password),
        activationToken: null,
        activationTokenExpires: null,
        activatedAt: new Date(),
      },
    });

    return true;
  }
}
