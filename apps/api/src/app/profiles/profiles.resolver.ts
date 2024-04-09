import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GetUser,
  Permissions,
  RbacService,
  UserValidate,
} from '@nx-nestjs-prisma-template/auth';
import { ProfilesService } from '@nx-nestjs-prisma-template/data-layer';
import {
  FindManyProfileArgs,
  Profile,
  ProfileUpdateInput,
} from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { PermissionEnum } from '@nx-nestjs-prisma-template/shared';
import { LocalBaseAuthResolver } from '../local-base-auth.resolver';
@Resolver(() => Profile)
export class ProfilesResolver extends LocalBaseAuthResolver {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly rbacService: RbacService,
  ) {
    super();
  }

  @Permissions(PermissionEnum.PROFILE_READ)
  @Query(() => [Profile], { name: 'ProfileFindMany' })
  async findMany(@Args() args: FindManyProfileArgs) {
    return await this.profilesService.findMany(args);
  }

  @Permissions(PermissionEnum.PROFILE_READ, PermissionEnum.PROFILE_READ_OTHER)
  @Query(() => Profile, { name: 'ProfileFindOne' })
  async findOne(
    @Args({ name: 'profileId', type: () => Int }) profileId: number,
    @GetUser() user: UserValidate,
  ) {
    await this.validateRbacRules(
      profileId,
      user,
      PermissionEnum.PROFILE_READ_OTHER,
    );

    const profile = await this.profilesService.findOne({
      where: { id: profileId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    return profile;
  }

  @Permissions(
    PermissionEnum.PROFILE_UPDATE,
    PermissionEnum.PROFILE_UPDATE_OTHER,
  )
  @Mutation(() => Profile, { name: 'ProfileUpdate' })
  async update(
    @Args({ name: 'profileId', type: () => Int }) profileId: number,
    @Args('data') data: ProfileUpdateInput,
    @GetUser() user: UserValidate,
  ) {
    await this.validateRbacRules(
      profileId,
      user,
      PermissionEnum.PROFILE_UPDATE_OTHER,
    );

    try {
      return await this.profilesService.update({
        where: { id: profileId },
        data,
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

  private async validateRbacRules(
    profileId: number,
    user: UserValidate,
    permission: PermissionEnum,
  ) {
    if (
      user.profileId !== profileId &&
      !(await this.rbacService.userHasPermissions(user.id, [permission]))
    )
      throw new ForbiddenException('You are not allowed to see this profile');

    return;
  }
}
