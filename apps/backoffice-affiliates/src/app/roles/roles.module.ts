import { Module } from '@nestjs/common';
import { RolesResolver } from './roles.resolver';

@Module({
  providers: [RolesResolver],
})
export class RolesModule {}
