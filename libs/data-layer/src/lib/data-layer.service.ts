import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsService } from './permissions/permissions.service';
import { RolesService } from './roles/roles.service';
import { UsersService } from './users/users.service';

@Injectable()
export class DataLayerService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async onModuleInit() {
    await this.rolesService.ensureRoles();
    await this.permissionsService.ensurePermissions();
    await this.usersService.ensureAdminUser();
  }
}
