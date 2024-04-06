import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nx-nestjs-prisma-template/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class OtpsService {
  private logger = new Logger(OtpsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  findFirst(args: Prisma.OtpFindFirstArgs) {
    return this.prismaService.otp.findFirst(args);
  }

  create(args: Prisma.OtpCreateArgs) {
    try {
      return this.prismaService.otp.create(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  delete(args: Prisma.OtpDeleteArgs) {
    try {
      return this.prismaService.otp.delete(args);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
