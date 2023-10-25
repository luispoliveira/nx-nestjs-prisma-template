import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Prisma } from '@prisma/client';
@Injectable()
export class AppsService {
  private logger = new Logger(AppsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findMany(args: Prisma.AppFindManyArgs) {
    return await this.prismaService.app.findMany(args);
  }

  async upsert(args: Prisma.AppUpsertArgs) {
    try {
      return await this.prismaService.app.upsert(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
