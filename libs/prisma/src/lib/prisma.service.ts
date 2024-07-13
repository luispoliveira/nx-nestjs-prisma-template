import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentEnum } from '@nx-nestjs-prisma-template/shared';
import { Prisma, PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    let log: Prisma.LogLevel[] = ['warn', 'error'];
    switch (configService.get<EnvironmentEnum>('environment')) {
      case EnvironmentEnum.Development:
        log.push('info');
        log.push('query');
        break;
      case EnvironmentEnum.Test:
        log.push('info');
        break;
    }
    const logPrisma = configService.get<boolean>('logPrisma');

    if (!logPrisma) log = [];

    super({
      log: log,
      errorFormat: 'pretty',
    });
  }
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      this.logger.error(e);
      this.onModuleInit();
    }
  }
}
