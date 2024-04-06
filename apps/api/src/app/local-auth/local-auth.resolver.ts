import { BadRequestException } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GetUser, Public, UserValidate } from '@nx-nestjs-prisma-template/auth';
import { UsersService } from '@nx-nestjs-prisma-template/data-layer';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { LocalBaseAuthResolver } from '../local-base-auth.resolver';
import { UsersResolver } from '../users/users.resolver';
import { LocalAuthService } from './local-auth.service';
import { Login } from './object-types/login.model';
@Resolver()
export class LocalAuthResolver extends LocalBaseAuthResolver {
  constructor(
    private readonly authService: LocalAuthService,
    private readonly usersService: UsersService,
    private readonly usersResolver: UsersResolver,
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

  @Mutation(() => User, { name: 'AuthRegister' })
  async register(@Args({ name: 'email', type: () => String }) email: string) {
    try {
      await this.usersResolver.create({ email }, {
        email: email,
      } as UserValidate);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Mutation(() => Login, { name: 'AuthVerifyLogin' })
  @Public()
  async verifyLogin(@Args({ name: 'otp', type: () => String }) code: string) {
    return await this.authService.verifyOtp(code);
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
