import { BadRequestException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GetUser,
  Permissions,
  UserValidate,
} from '@nx-nestjs-prisma-template/auth';
import { RolesService } from '@nx-nestjs-prisma-template/data-layer';
import {
  CreateOneRoleArgs,
  FindManyRoleArgs,
  Role,
  RoleUpdateInput,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
import { LocalBaseAuthResolver } from '../local-base-auth.resolver';
@Resolver(() => Role)
export class RolesResolver extends LocalBaseAuthResolver {
  constructor(private readonly rolesService: RolesService) {
    super();
  }

  @Permissions(PermissionEnum.ROLE_READ)
  @Query(() => [Role], { name: 'RoleFindMany' })
  async findMany(@Args() args: FindManyRoleArgs) {
    return await this.rolesService.findMany(args);
  }

  @Permissions(PermissionEnum.ROLE_CREATE)
  @Mutation(() => Role, { name: 'RoleCreate' })
  async create(@Args() args: CreateOneRoleArgs, @GetUser() user: UserValidate) {
    try {
      args.data = {
        ...args.data,
        createdBy: user.email,
        updatedBy: user.email,
      };
      return await this.rolesService.create(args);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Permissions(PermissionEnum.ROLE_UPDATE)
  @Mutation(() => Role, { name: 'RoleUpdate' })
  async update(
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @Args({ name: 'data', type: () => RoleUpdateInput }) data: RoleUpdateInput,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.rolesService.update({
        where: { id: roleId },
        data: {
          ...data,
          updatedBy: user.email,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Permissions(PermissionEnum.RBAC_LINK_PERM_ROLE)
  @Mutation(() => Role, { name: 'RoleLinkPermission' })
  async addPermissionToRole(
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @Args({ name: 'permissionId', type: () => Int }) permissionId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.rolesService.update({
        where: {
          id: roleId,
        },
        data: {
          Permissions2Roles: {
            upsert: {
              where: {
                roleId_permissionId: {
                  roleId,
                  permissionId,
                },
              },
              create: {
                permissionId,
                createdBy: user.email,
                updatedBy: user.email,
                isActive: true,
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
      throw new BadRequestException(e);
    }
  }

  @Permissions(PermissionEnum.RBAC_LINK_PERM_ROLE)
  @Mutation(() => Role, { name: 'RoleUnlinkPermission' })
  async removePermissionFromRole(
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @Args({ name: 'permissionId', type: () => Int }) permissionId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.rolesService.update({
        where: {
          id: roleId,
        },
        data: {
          Permissions2Roles: {
            upsert: {
              where: {
                roleId_permissionId: {
                  permissionId,
                  roleId,
                },
              },
              create: {
                permissionId,
                createdBy: user.email,
                updatedBy: user.email,
                isActive: false,
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
      throw new BadRequestException(e);
    }
  }
}
