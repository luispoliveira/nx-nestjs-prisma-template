import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  GoogleOauthDataType,
  JwtPayloadType,
} from '@nx-nestjs-prisma-template/auth';
import {
  OtpsService,
  UsersService,
} from '@nx-nestjs-prisma-template/data-layer';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import {
  DateTimeUtil,
  OtpUtil,
  PasswordUtil,
  TokenUtil,
} from '@nx-nestjs-prisma-template/shared';
import { TwilioService } from '@nx-nestjs-prisma-template/twilio';

@Injectable()
export class LocalAuthService {
  private logger = new Logger(LocalAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpsService: OtpsService,
    private readonly twilioService: TwilioService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findFirst({
      where: {
        email: email,
        isActive: true,
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

    if (!user.twoFA) {
      const payload: JwtPayloadType = {
        userId: user.id,
        email: user.email,
        permissions,
        roles,
      };
      return await this.signJwt(payload);
    }

    const otp = OtpUtil.generate(6);
    await this.otpsService.create({
      data: {
        user: { connect: { id: user.id } },
        code: otp,
        useCase: 'LOGIN',
        expiresAt: TokenUtil.getExpirationDate(2), //2 minutes
      },
    });

    if (user.twoFAPhone && user.twoFAPhoneVerified)
      await this.twilioService.sendSms(user.twoFAPhone, `Your OTP is ${otp}`);
  }

  async loginGoogle(user: GoogleOauthDataType) {
    const existingUser = await this.usersService.findFirst({
      where: {
        email: user.email,
        isActive: true,
      },
    });

    if (!existingUser) {
      const newUser = await this.usersService.create({
        data: {
          email: user.email,
          password: await PasswordUtil.hash(PasswordUtil.generate(12)),
          isActive: true,
          twoFA: false,
          createdBy: 'GOOGLE_AUTH',
          updatedBy: 'GOOGLE_AUTH',
          Profile: {
            create: {
              firstName: user.profile?.firstName,
              lastName: user.profile?.lastName,
              createdBy: 'GOOGLE_AUTH',
              updatedBy: 'GOOGLE_AUTH',
            },
          },
        },
      });

      const permissions = await this.usersService.getUserPermissions(
        newUser.id,
      );
      const roles = await this.usersService.getUserRoles(newUser.id);

      const payload: JwtPayloadType = {
        userId: newUser.id,
        email: newUser.email,
        permissions,
        roles,
      };

      return await this.signJwt(payload);
    }
    const permissions = await this.usersService.getUserPermissions(
      existingUser.id,
    );
    const roles = await this.usersService.getUserRoles(existingUser.id);

    const payload: JwtPayloadType = {
      userId: existingUser.id,
      email: existingUser.email,
      permissions,
      roles,
    };

    return await this.signJwt(payload);
  }

  async verifyOtp(code: string) {
    const otp = await this.otpsService.findFirst({
      where: {
        code: code,
        useCase: 'LOGIN',
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) throw new NotFoundException('OTP not found');

    const isExpired = DateTimeUtil.isTokenExpired(otp.expiresAt);
    if (isExpired) throw new UnauthorizedException('OTP expired');

    const user = await this.usersService.findUnique({
      where: {
        id: otp.userId,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const permissions = await this.usersService.getUserPermissions(user.id);
    const roles = await this.usersService.getUserRoles(user.id);

    const payload: JwtPayloadType = {
      userId: user.id,
      email: user.email,
      permissions,
      roles,
    };

    return await this.signJwt(payload);
  }

  private async signJwt(payload: JwtPayloadType) {
    await this.usersService.update({
      where: { id: payload.userId },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      userId: payload.userId,
      email: payload.email,
      permissions: payload.permissions,
      roles: payload.roles,
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
