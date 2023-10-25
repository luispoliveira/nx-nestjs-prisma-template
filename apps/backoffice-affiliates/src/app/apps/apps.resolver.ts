import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permissions } from '@nx-nestjs-prisma-template/auth';
import { AppsService } from '@nx-nestjs-prisma-template/data-layer';
import { BaseAuthResolver } from '@nx-nestjs-prisma-template/graphql';
import {
  App,
  FindManyAppArgs,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
@Resolver(() => App)
export class AppsResolver extends BaseAuthResolver {
  constructor(private readonly appsService: AppsService) {
    super();
  }

  @Query(() => [App], { name: 'AppFindAll' })
  @Permissions(PermissionEnum.APP_READ)
  async findMany(@Args() args: FindManyAppArgs) {
    return this.appsService.findMany(args);
  }
}
