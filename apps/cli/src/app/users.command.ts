import { Injectable } from '@nestjs/common';
import { UsersService } from '@nx-nestjs-prisma-template/data-layer';
import { PasswordUtil } from '@nx-nestjs-prisma-template/shared';
import { Command, Option } from 'nestjs-command';

@Injectable()
export class UsersCommand {
  constructor(private readonly _usersService: UsersService) {}

  @Command({
    command: 'user:create <email> <roles> <apps>',
    describe: 'Create a user',
  })
  async createUser(
    @Option({
      name: 'email',
      describe: 'User email',
      type: 'string',
      required: true,
      alias: 'e',
    })
    email: string,
    @Option({
      name: 'roles',
      describe: 'Roles Ids',
      type: 'string',
      required: false,
      alias: 'r',
    })
    roles?: string,
    @Option({
      name: 'apps',
      describe: 'Apps Ids',
      type: 'string',
      required: false,
      alias: 'a',
    })
    apps?: string,
  ) {
    let explodedRoles: string[] = [];
    let explodedApps: string[] = [];
    if (roles) explodedRoles = roles.split(',');
    if (apps) explodedApps = apps.split(',');

    const password = PasswordUtil.generate(8);

    try {
      const user = await this._usersService.create({
        data: {
          email: email,
          password: await PasswordUtil.hash(password),
          isActive: true,
          activatedAt: new Date(),
          createdBy: 'admin',
          updatedBy: 'admin',
          Profile: {
            create: {
              createdBy: 'admin',
              updatedBy: 'admin',
            },
          },
          User2Apps: {
            createMany: {
              skipDuplicates: true,
              data: explodedApps.map((appId) => ({
                appId: parseInt(appId),
                isActive: true,
                createdBy: 'admin',
                updatedBy: 'admin',
              })),
            },
          },
          Roles2Users: {
            createMany: {
              skipDuplicates: true,
              data: explodedRoles.map((roleId) => ({
                roleId: parseInt(roleId),
                isActive: true,
                createdBy: 'admin',
                updatedBy: 'admin',
              })),
            },
          },
        },
      });
      console.log(
        `User created with email: ${email} and password: ${password}`,
      );
      return;
    } catch (e) {
      console.error(e);
    }
  }

  @Command({
    command: 'user:activate <email>',
    describe: 'Activate a user',
  })
  async activateUser(
    @Option({
      name: 'email',
      describe: 'User email',
      type: 'string',
      required: true,
      alias: 'e',
    })
    email: string,
  ) {
    try {
      const user = await this._usersService.update({
        where: {
          email: email,
        },
        data: {
          isActive: true,
          activatedAt: new Date(),
          updatedBy: 'admin',
        },
      });
      console.log(`User with email: ${email} activated`);
    } catch (e) {
      console.error(e);
    }
  }

  @Command({
    command: 'user:deactivate <email>',
    describe: 'Deactivate a user',
  })
  async deactivateUser(
    @Option({
      name: 'email',
      describe: 'User email',
      type: 'string',
      required: true,
      alias: 'e',
    })
    email: string,
  ) {
    try {
      const user = await this._usersService.update({
        where: {
          email: email,
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          updatedBy: 'admin',
        },
      });
      console.log(`User with email: ${email} deactivated`);
    } catch (e) {
      console.error(e);
    }
  }
}
