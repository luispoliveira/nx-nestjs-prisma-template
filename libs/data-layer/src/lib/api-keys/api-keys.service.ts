import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Prisma } from '@prisma/client';
@Injectable()
export class ApiKeysService {
  private logger = new Logger(ApiKeysService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(args: Prisma.ApiKeyFindUniqueArgs) {
    return this.prismaService.apiKey.findUnique(args);
  }
}
