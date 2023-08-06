import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class LogsService {
  private logger = new Logger(LogsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(args: Prisma.LogCreateArgs) {
    try {
      return await this.prismaService.log.create(args);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async update(args: Prisma.LogUpdateArgs) {
    try {
      return await this.prismaService.log.update(args);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
