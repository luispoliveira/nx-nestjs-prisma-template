import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GetUser,
  Permissions,
  RbacService,
  UserValidate,
} from '@nx-nestjs-prisma-template/auth';
import {
  ProfilesService,
  UsersService,
} from '@nx-nestjs-prisma-template/data-layer';
import { BaseAuthResolver } from '@nx-nestjs-prisma-template/graphql';
import {
  CreateOneUserArgs,
  FindManyUserArgs,
  FindUniqueUserArgs,
  Profile,
  ProfileUpdateInput,
  UpdateOneUserArgs,
  User,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import {
  PasswordUtil,
  PermissionEnum,
  TokenUtil,
} from '@nx-nestjs-prisma-template/shared';

@Resolver(() => User)
export class UsersResolver extends BaseAuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly profilesService: ProfilesService,
  ) {
    super();
  }

  @Query(() => [User], { name: 'UserFindAll' })
  @Permissions(PermissionEnum.USER_READ)
  async findAll(@Args() args: FindManyUserArgs) {
    return await this.usersService.findMany(args);
  }

  @Query(() => User, { name: 'UserFindOne' })
  @Permissions(PermissionEnum.USER_READ)
  async findOne(@Args() args: FindUniqueUserArgs) {
    const user = await this.usersService.findUnique(args);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Mutation(() => User, { name: 'UserCreate' })
  @Permissions(PermissionEnum.USER_CREATE)
  async create(@Args() args: CreateOneUserArgs, @GetUser() user: UserValidate) {
    try {
      const newUser = await this.usersService.create({
        data: {
          ...args.data,
          Profile: {
            create: {
              createdBy: user.email,
              updatedBy: user.email,
            },
          },
          isActive: false,
          password: await PasswordUtil.generate(12),
          activationToken: TokenUtil.generate(),
          activationTokenExpires: TokenUtil.getExpirationDate(),
          createdBy: user.email,
          updatedBy: user.email,
        },
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
  async update(@Args() args: UpdateOneUserArgs, @GetUser() user: UserValidate) {
    const where = args.where;
    if (
      !this.rbacService.userHasPermissions(user.id, [
        PermissionEnum.USER_UPDATE_OTHER,
      ])
    ) {
      where.id = user.id;
    }

    try {
      if (args.data.password.set)
        args.data.password.set = await PasswordUtil.hash(
          args.data.password.set,
        );
      return await this.usersService.update({
        data: {
          ...args.data,
          updatedBy: user.email,
        },
        where,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => User, { name: 'UserActivate' })
  @Permissions(PermissionEnum.USER_ACTIVATE)
  async activate(
    @Args() args: FindUniqueUserArgs,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: args.where,
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
    @Args() args: FindUniqueUserArgs,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: args.where,
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
  @Permissions(PermissionEnum.USER_LINK_ROLE)
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
  @Permissions(PermissionEnum.USER_LINK_ROLE)
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
  @Permissions(PermissionEnum.USER_LINK_PERMISSION)
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
  @Permissions(PermissionEnum.USER_LINK_PERMISSION)
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

  @Mutation(() => User, { name: 'UserLinkApp' })
  @Permissions(PermissionEnum.USER_LINK_APP)
  async linkApp(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'appId', type: () => Int }) appId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          User2Apps: {
            upsert: {
              where: {
                userId_appId: {
                  userId,
                  appId,
                },
              },
              create: {
                app: {
                  connect: {
                    id: appId,
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

  @Mutation(() => User, { name: 'UserUnlinkApp' })
  @Permissions(PermissionEnum.USER_LINK_APP)
  async unlinkApp(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'appId', type: () => Int }) appId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.usersService.update({
        where: { id: userId },
        data: {
          User2Apps: {
            upsert: {
              where: {
                userId_appId: {
                  userId,
                  appId,
                },
              },
              create: {
                app: {
                  connect: {
                    id: appId,
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

  @Mutation(() => Profile, { name: 'UserUpdateProfile' })
  async updateProfile(
    @Args({ name: 'profileUpdateInput', type: () => ProfileUpdateInput })
    profileUpdateInput: ProfileUpdateInput,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.profilesService.update({
        where: {
          userId: user.id,
        },
        data: {
          ...profileUpdateInput,
          updatedBy: user.email,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
