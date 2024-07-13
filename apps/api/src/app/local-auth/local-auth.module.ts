import { Module } from '@nestjs/common';
import { LocalAuthController } from './local-auth.controller';
import { LocalAuthResolver } from './local-auth.resolver';
import { LocalAuthService } from './local-auth.service';

@Module({
  providers: [LocalAuthService, LocalAuthResolver],
  controllers: [LocalAuthController],
})
export class LocalAuthModule {}
