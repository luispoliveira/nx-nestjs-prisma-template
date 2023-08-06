import { UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '@nx-nestjs-prisma-template/auth';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
import { Request } from '@nx-nestjs-prisma-template/shared';
import { AppInterceptor } from '../app.interceptor';
import { AuthService } from './auth.service';
import { LoginInput } from './input-types/login.input';
import { Login } from './object-types/login.model';
@Resolver(() => User)
@UseInterceptors(AppInterceptor)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => Login, { name: 'AuthLogin' })
  async login(@Args('data') data: LoginInput, @Request() request) {
    const user = await this.authService.validateUser(
      data.username,
      data.password,
    );
    if (!user || !user.isActive)
      throw new UnauthorizedException('User not found or not active');
    return await this.authService.login(user as User);
  }
}
