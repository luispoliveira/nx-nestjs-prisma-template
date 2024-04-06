import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@nx-nestjs-prisma-template/prisma';
import { ApiKeysService } from './api-keys/api-keys.service';
import { AppsService } from './apps/apps.service';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { DataLayerService } from './data-layer.service';
import { LogsService } from './logs/logs.service';
import { OtpsService } from './otps.service';
import { PermissionsService } from './permissions/permissions.service';
import { ProfilesService } from './profiles/porfiles.service';
import { RolesService } from './roles/roles.service';
import { UsersService } from './users/users.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
  ],
  providers: [
    DataLayerService,
    UsersService,
    RolesService,
    PermissionsService,
    LogsService,
    ApiKeysService,
    AppsService,
    ProfilesService,
    OtpsService,
  ],
  exports: [
    UsersService,
    RolesService,
    PermissionsService,
    LogsService,
    ApiKeysService,
    AppsService,
    ProfilesService,
    OtpsService,
  ],
})
export class DataLayerModule {}
