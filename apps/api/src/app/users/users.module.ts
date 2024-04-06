import { Global, Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';

@Global()
@Module({
  providers: [UsersResolver],
  exports: [UsersResolver],
})
export class UsersModule {}
