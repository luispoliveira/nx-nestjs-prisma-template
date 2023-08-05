import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@nx-nestjs-prisma-template/prisma';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { DataLayerService } from './data-layer.service';
import { PermissionsService } from './permissions/permissions.service';
import { RolesService } from './roles/roles.service';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
  ],
  controllers: [],
  providers: [DataLayerService, UsersService, RolesService, PermissionsService],
  exports: [UsersService, RolesService, PermissionsService],
})
export class DataLayerModule {}
