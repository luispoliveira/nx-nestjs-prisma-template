import { Permissions } from '@nx-nestjs-prisma-template/auth';

import { Args, Query, Resolver } from '@nestjs/graphql';
import { PermissionsService } from '@nx-nestjs-prisma-template/data-layer';
import { BaseAuthResolver } from '@nx-nestjs-prisma-template/graphql';
import {
  FindManyPermissionArgs,
  Permission,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
@Resolver(() => Permission)
export class PermissionsResolver extends BaseAuthResolver {
  constructor(private readonly permissionsService: PermissionsService) {
    super();
  }
  @Query(() => [Permission], { name: 'PermissionFindAll' })
  @Permissions(PermissionEnum.PERMISSION_READ)
  async findAll(@Args() args: FindManyPermissionArgs) {
    return await this.permissionsService.findMany(args);
  }
}
