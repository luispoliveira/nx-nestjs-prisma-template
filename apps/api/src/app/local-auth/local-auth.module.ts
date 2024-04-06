import { Module } from '@nestjs/common';
import { LocalAuthResolver } from './local-auth.resolver';
import { LocalAuthService } from './local-auth.service';

@Module({
  providers: [LocalAuthService, LocalAuthResolver],
})
export class LocalAuthModule {}
