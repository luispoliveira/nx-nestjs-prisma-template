import {
  GetUser,
  Permissions,
  UserValidate,
} from '@nx-nestjs-prisma-template/auth';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RolesService } from '@nx-nestjs-prisma-template/data-layer';
import { BaseAuthResolver } from '@nx-nestjs-prisma-template/graphql';
import {
  CreateOneRoleArgs,
  FindManyRoleArgs,
  FindUniqueRoleArgs,
  Role,
  UpdateOneRoleArgs,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
@Resolver(() => Role)
export class RolesResolver extends BaseAuthResolver {
  constructor(private readonly rolesService: RolesService) {
    super();
  }

  @Query(() => [Role], { name: 'RoleFindAll' })
  @Permissions(PermissionEnum.ROLE_READ)
  async findAll(@Args() args: FindManyRoleArgs) {
    return await this.rolesService.findMany(args);
  }

  @Query(() => [Role], { name: 'RoleFindOne' })
  @Permissions(PermissionEnum.ROLE_READ)
  async findOne(@Args() args: FindUniqueRoleArgs) {
    const role = await this.rolesService.findUnique(args);
    if (!role) throw new NotFoundException();
    return role;
  }

  @Mutation(() => Role, { name: 'RoleCreate' })
  @Permissions(PermissionEnum.ROLE_CREATE)
  async create(@Args() args: CreateOneRoleArgs, @GetUser() user: UserValidate) {
    try {
      return await this.rolesService.create({
        data: {
          ...args.data,
          createdBy: user.email,
          updatedBy: user.email,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => Role, { name: 'RoleUpdate' })
  @Permissions(PermissionEnum.ROLE_UPDATE)
  async update(@Args() args: UpdateOneRoleArgs, @GetUser() user: UserValidate) {
    try {
      return await this.rolesService.update({
        where: args.where,
        data: {
          ...args.data,
          updatedBy: user.email,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => Role, { name: 'RoleLinkPermission' })
  @Permissions(PermissionEnum.ROLE_LINK_PERMISSION)
  async linkPermission(
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @Args({ name: 'permissionId', type: () => Int }) permissionId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.rolesService.update({
        where: { id: roleId },
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
                permission: { connect: { id: permissionId } },
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

  @Mutation(() => Role, { name: 'RoleUnlinkPermission' })
  @Permissions(PermissionEnum.ROLE_LINK_PERMISSION)
  async unlinkPermission(
    @Args({ name: 'roleId', type: () => Int }) roleId: number,
    @Args({ name: 'permissionId', type: () => Int }) permissionId: number,
    @GetUser() user: UserValidate,
  ) {
    try {
      return await this.rolesService.update({
        where: { id: roleId },
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
                permission: { connect: { id: permissionId } },
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
}
