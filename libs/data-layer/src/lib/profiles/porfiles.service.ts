import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Prisma } from '@prisma/client';
@Injectable()
export class ProfilesService {
  private logger = new Logger(ProfilesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(args: Prisma.ProfileFindManyArgs) {
    return await this.prismaService.profile.findMany(args);
  }

  async findOne(args: Prisma.ProfileFindUniqueArgs) {
    return await this.prismaService.profile.findUnique(args);
  }

  async update(args: Prisma.ProfileUpdateArgs) {
    try {
      return await this.prismaService.profile.update(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
