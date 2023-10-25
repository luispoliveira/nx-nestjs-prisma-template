import { Module } from '@nestjs/common';
import { AuthModule } from '@nx-nestjs-prisma-template/auth';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [AuthModule],
  providers: [UsersResolver],
})
export class UsersModule {}
