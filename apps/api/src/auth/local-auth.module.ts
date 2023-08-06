import { Module } from '@nestjs/common';
import { AuthModule } from '@nx-nestjs-prisma-template/auth';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [AuthModule],
  providers: [AuthService, AuthResolver],
})
export class LocalAuthModule {}
