import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { GraphqlModule } from '@nx-nestjs-prisma-template/graphql';
import { AppService } from './app.service';
import { AppsModule } from './apps/apps.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { LocalAuthModule } from './local-auth/local-auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DataLayerModule,
    GraphqlModule,
    LocalAuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AppsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
