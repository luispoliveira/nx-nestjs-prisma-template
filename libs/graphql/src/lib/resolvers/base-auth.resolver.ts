import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@nx-nestjs-prisma-template/auth';

@UseGuards(JwtAuthGuard)
export class BaseAuthResolver {}
