import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permissions } from '@nx-nestjs-prisma-template/auth';
import { AppsService } from '@nx-nestjs-prisma-template/data-layer';
import {
  App,
  FindManyAppArgs,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
import { LocalBaseAuthResolver } from '../local-base-auth.resolver';
@Resolver(() => App)
export class AppsResolver extends LocalBaseAuthResolver {
  constructor(private readonly appsService: AppsService) {
    super();
  }

  @Permissions(PermissionEnum.APP_READ)
  @Query(() => [App], { name: 'AppFindMany' })
  async findMany(@Args() args: FindManyAppArgs) {
    return await this.appsService.findMany(args);
  }
}
