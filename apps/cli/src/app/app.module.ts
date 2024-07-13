import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { SharedModule } from '@nx-nestjs-prisma-template/shared';
import { CommandModule } from 'nestjs-command';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { UsersCommand } from './users.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
    }),
    SharedModule,
    CommandModule,
    DataLayerModule,
  ],
  providers: [UsersCommand],
})
export class AppModule {}
