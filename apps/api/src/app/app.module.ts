import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@nx-nestjs-prisma-template/auth';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { GraphqlModule } from '@nx-nestjs-prisma-template/graphql';
import { TwilioModule } from '@nx-nestjs-prisma-template/twilio';
import { AppService } from './app.service';
import { AppsResolver } from './apps/apps.resolver';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { LocalAuthModule } from './local-auth/local-auth.module';
import { PermissionsResolver } from './permissions/permissions.resolver';
import { ProfilesResolver } from './profiles/profiles.resolver';
import { RolesResolver } from './roles/roles.resolver';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DataLayerModule,
    AuthModule.register(),
    GraphqlModule,
    TwilioModule.register(),
    LocalAuthModule,
    UsersModule,
  ],
  providers: [
    AppService,
    PermissionsResolver,
    RolesResolver,
    AppsResolver,
    ProfilesResolver,
  ],
})
export class AppModule {}
