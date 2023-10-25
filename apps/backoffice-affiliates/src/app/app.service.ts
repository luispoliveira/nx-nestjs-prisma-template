import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppsService } from '@nx-nestjs-prisma-template/data-layer';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly appsService: AppsService,
  ) {}
  async onModuleInit() {
    await this.ensureApp();
  }

  async ensureApp() {
    const appName = this.configService.get<string>('appName');
    const adminEmail = this.configService.get<{ email: string }>('admin').email;

    await this.appsService.upsert({
      where: { name: appName },
      create: {
        name: appName,
        User2Apps: {
          create: {
            user: {
              connect: { email: adminEmail },
            },
          },
        },
      },
      update: {},
    });
  }
}
