import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permissions } from '@nx-nestjs-prisma-template/auth';
import { PermissionsService } from '@nx-nestjs-prisma-template/data-layer';
import {
  FindManyPermissionArgs,
  Permission,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
import { LocalBaseAuthResolver } from '../local-base-auth.resolver';
@Resolver(() => Permission)
export class PermissionsResolver extends LocalBaseAuthResolver {
  constructor(private readonly permissionsService: PermissionsService) {
    super();
  }

  @Permissions(PermissionEnum.PERMISSION_READ)
  @Query(() => [Permission], { name: 'PermissionFindMany' })
  async findMany(@Args() args: FindManyPermissionArgs) {
    return await this.permissionsService.findMany(args);
  }
}
