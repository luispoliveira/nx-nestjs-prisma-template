import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GetUser, Public, UserValidate } from '@nx-nestjs-prisma-template/auth';
import { UsersService } from '@nx-nestjs-prisma-template/data-layer';
import { BaseAuthResolver } from '@nx-nestjs-prisma-template/graphql';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { LocalAuthService } from './local-auth.service';
import { Login } from './object-types/login.model';
@Resolver()
export class LocalAuthResolver extends BaseAuthResolver {
  constructor(
    private readonly authService: LocalAuthService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  @Mutation(() => Login, { name: 'AuthLogin' })
  @Public()
  async login(
    @Args({ name: 'email', type: () => String }) email: string,
    @Args({ name: 'password', type: () => String }) password: string,
  ) {
    const user = await this.authService.validateUser(email, password);

    return await this.authService.login(user);
  }

  @Mutation(() => User, { name: 'AuthWhoAmI' })
  async whoAmI(@GetUser() user: UserValidate) {
    return await this.usersService.findUnique({
      where: {
        id: user.id,
      },
    });
  }

  @Mutation(() => Boolean, { name: 'AuthForgetPassword' })
  @Public()
  async forgetPassword(
    @Args({ name: 'email', type: () => String }) email: string,
  ) {
    return await this.authService.forgetPassword(email);
  }

  @Mutation(() => Boolean, { name: 'AuthRecoverPassword' })
  @Public()
  async recoverPassword(
    @Args({ name: 'token', type: () => String }) token: string,
    @Args({ name: 'password', type: () => String }) password: string,
  ) {
    return await this.authService.recoverPassword(token, password);
  }

  @Mutation(() => Boolean, { name: 'AuthActivateAccount' })
  @Public()
  async activateAccount(
    @Args({ name: 'token', type: () => String }) token: string,
    @Args({ name: 'password', type: () => String }) password: string,
  ) {
    return await this.authService.activateAccount(token, password);
  }
}
