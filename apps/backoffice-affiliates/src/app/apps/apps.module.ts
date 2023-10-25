import { Module } from '@nestjs/common';
import { AppsResolver } from './apps.resolver';

@Module({
  providers: [AppsResolver],
})
export class AppsModule {}
