import { UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from '@nx-nestjs-prisma-template/auth';
@UseGuards(ApiKeyAuthGuard)
export class BaseApiKeyResolver {}
