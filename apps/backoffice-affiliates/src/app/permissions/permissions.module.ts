import { Module } from '@nestjs/common';
import { PermissionsResolver } from './permissions.resolver';

@Module({
  providers: [PermissionsResolver],
})
export class PermissionsModule {}
