import {
  BadRequestException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GetUser,
  Permissions,
  RbacService,
  UserValidate,
} from '@nx-nestjs-prisma-template/auth';
import {
  OtpsService,
  UsersService,
} from '@nx-nestjs-prisma-template/data-layer';
import {
  FindManyUserArgs,
  User,
  UserCreateInput,
  UserUpdateInput,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import {
  DateTimeUtil,
  OtpUtil,
  PasswordUtil,
  PermissionEnum,
  TokenUtil,
} from '@nx-nestjs-prisma-template/shared';
import { TwilioService } from '@nx-nestjs-prisma-template/twilio';
import { Prisma } from '@prisma/client';
import { LocalBaseAuthResolver } from '../local-base-auth.resolver';
import { LoggerInterceptor } from '../logger.interceptor';
@UseInterceptors(LoggerInterceptor)
@Resolver(() => User)
export class UsersResolver extends LocalBaseAuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly otpsService: OtpsService,
    private readonly twilioService: TwilioService,
  ) {
    super();
  }

  @Query(() => [User], { name: 'UserFindAll' })
  @Permissions(PermissionEnum.USER_READ)
  async findAll(@Args() args: FindManyUserArgs) {
    return await this.usersService.findMany(args as Prisma.UserFindManyArgs);
  }

  @Query(() => User, { name: 'UserFindOne' })
  @Permissions(PermissionEnum.USER_READ)
  async findOne(@Args({ name: 'id', type: () => Int }) userId: number) {
    const user = await this.usersService.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return user;
  }

  @Mutation(() => User, { name: 'UserCreate' })
  @Permissions(PermissionEnum.USER_CREATE)
  async create(
    @Args({ name: 'input', type: () => UserCreateInput })
    input: UserCreateInput,

    @GetUser() user: UserValidate,
  ) {
    const data = {
      ...input,
      isActive: false,
      password: await PasswordUtil.generate(12),
      activationToken: TokenUtil.generate(),
      activationTokenExpires: TokenUtil.getExpirationDate(),
      createdBy: user.email,
      updatedBy: user.email,
    };

    try {
      const newUser = await this.usersService.create({
        data: data,
      });

      /**
       * TODO: Send email with activation token
       */

      return newUser;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserUpdate' })
  @Permissions(PermissionEnum.USER_UPDATE, PermissionEnum.USER_UPDATE_OTHER)
  async update(
    @Args({ name: 'id', type: () => Int }) userId: number,
    @Args({ name: 'input', type: () => UserUpdateInput })
    input: UserUpdateInput,
    @GetUser() user: UserValidate,
  ) {
    const where = {
      id: userId,
    };
    if (
      !this.rbacService.userHasPermissions(user.id, [
        PermissionEnum.USER_UPDATE_OTHER,
      ])
    ) {
      where.id = user.id;
    }

    try {
      if (input.password.set)
        input.password.set = await PasswordUtil.hash(input.password.set);

      const data = {
        ...input,
        updatedBy: user.email,
      };

      return await this.usersService.update({
        where: where,
        data: data,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserActivate' })
  @Permissions(PermissionEnum.USER_ACTIVATE)
  async activate(
    @Args({ name: 'id', type: () => Int }) userId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          isActive: true,
          activatedAt: new Date(),
          updatedBy: user.email,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserDeactivate' })
  @Permissions(PermissionEnum.USER_ACTIVATE)
  async deactivate(
    @Args({ name: 'id', type: () => Int }) userId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          updatedBy: user.email,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserLinkRole' })
  @Permissions(PermissionEnum.RBAC_LINK_ROLE_USER)
  async linkRole(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          Roles2Users: {
            upsert: {
              where: {
                userId_roleId: {
                  userId,
                  roleId,
                },
              },
              create: {
                role: {
                  connect: {
                    id: roleId,
                  },
                },
                isActive: true,
                createdBy: user.email,
                updatedBy: user.email,
              },
              update: {
                isActive: true,
                updatedBy: user.email,
              },
            },
          },
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserUnlinkRole' })
  @Permissions(PermissionEnum.RBAC_LINK_ROLE_USER)
  async unlinkRole(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          Roles2Users: {
            upsert: {
              where: {
                userId_roleId: {
                  userId,
                  roleId,
                },
              },
              create: {
                role: {
                  connect: {
                    id: roleId,
                  },
                },
                isActive: false,
                createdBy: user.email,
                updatedBy: user.email,
              },
              update: {
                isActive: false,
                updatedBy: user.email,
              },
            },
          },
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserLinkPermission' })
  @Permissions(PermissionEnum.RBAC_LINK_PERM_USER)
  async linkPermission(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'permissionId', type: () => Int }) permissionId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          Permissions2Users: {
            upsert: {
              where: {
                userId_permissionId: {
                  userId,
                  permissionId,
                },
              },
              create: {
                permission: {
                  connect: {
                    id: permissionId,
                  },
                },
                isActive: true,
                createdBy: user.email,
                updatedBy: user.email,
              },
              update: {
                isActive: true,
                updatedBy: user.email,
              },
            },
          },
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserUnLinkPermission' })
  @Permissions(PermissionEnum.RBAC_LINK_PERM_USER)
  async unlinkPermission(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'permissionId', type: () => Int }) permissionId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          Permissions2Users: {
            upsert: {
              where: {
                userId_permissionId: {
                  userId,
                  permissionId,
                },
              },
              create: {
                permission: {
                  connect: {
                    id: permissionId,
                  },
                },
                isActive: false,
                createdBy: user.email,
                updatedBy: user.email,
              },
              update: {
                isActive: false,
                updatedBy: user.email,
              },
            },
          },
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => Boolean, { name: 'UserEnable2FA' })
  async enable2FA(
    @Args({ name: 'phoneNumber', type: () => String }) phoneNumber,
    @GetUser() loggedUser: UserValidate,
  ) {
    const user = await this.usersService.findUnique({
      where: { email: loggedUser.email },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.twoFAPhoneVerified) return true;

    await this.usersService.update({
      where: { id: user.id },
      data: {
        twoFAPhone: phoneNumber,
      },
    });

    const otp = OtpUtil.generate(6);
    await this.otpsService.create({
      data: {
        user: { connect: { id: user.id } },
        code: otp,
        useCase: 'PHV',
        expiresAt: DateTimeUtil.getExpiryDate(2), //2 minutes
      },
    });

    await this.twilioService.sendSms(phoneNumber, `Your OTP is ${otp}`);

    return true;
  }

  @Mutation(() => Boolean, { name: 'UserValidate2FA' })
  async validate2FA(
    @Args({ name: 'code', type: () => String }) code: string,
    @GetUser() loggedUser: UserValidate,
  ) {
    const otp = await this.otpsService.findFirst({
      where: {
        code: code,
        useCase: 'PHV',
        userId: loggedUser.id,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) throw new NotFoundException('OTP not found');

    const isExpired = DateTimeUtil.isTokenExpired(otp.expiresAt);
    if (isExpired) throw new BadRequestException('OTP expired');

    await this.usersService.update({
      where: { id: loggedUser.id },
      data: {
        twoFAPhoneVerified: true,
      },
    });

    await this.otpsService.delete({
      where: { id: otp.id },
    });

    return true;
  }

  @Mutation(() => Boolean, { name: 'UserDisable2FA' })
  async disable2FA(@GetUser() loggedUser: UserValidate) {
    const user = await this.usersService.findUnique({
      where: { email: loggedUser.email },
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.twoFAPhoneVerified || !user.twoFAPhone) return true;

    const otp = OtpUtil.generate(6);
    await this.otpsService.create({
      data: {
        user: { connect: { id: user.id } },
        code: otp,
        useCase: 'D2FA',
        expiresAt: DateTimeUtil.getExpiryDate(2), //2 minutes
      },
    });

    await this.twilioService.sendSms(user.twoFAPhone, `Your OTP is ${otp}`);

    return true;
  }

  @Mutation(() => Boolean, { name: 'UserUnvalidate2FA' })
  async unvalidate2FA(
    @Args({ name: 'code', type: () => String }) code: string,
    @GetUser() loggedUser: UserValidate,
  ) {
    const otp = await this.otpsService.findFirst({
      where: {
        code: code,
        useCase: 'D2FA',
        userId: loggedUser.id,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) throw new NotFoundException('OTP not found');

    const isExpired = DateTimeUtil.isTokenExpired(otp.expiresAt);
    if (isExpired) throw new BadRequestException('OTP expired');

    await this.usersService.update({
      where: { id: loggedUser.id },
      data: {
        twoFAPhoneVerified: false,
        twoFAPhone: null,
      },
    });

    await this.otpsService.delete({
      where: { id: otp.id },
    });

    return true;
  }
}
