import { Module } from '@nestjs/common';
import { AuthModule } from '@nx-nestjs-prisma-template/auth';
import { LocalAuthResolver } from './local-auth.resolver';
import { LocalAuthService } from './local-auth.service';

@Module({
  imports: [AuthModule],
  providers: [LocalAuthService, LocalAuthResolver],
})
export class LocalAuthModule {}
