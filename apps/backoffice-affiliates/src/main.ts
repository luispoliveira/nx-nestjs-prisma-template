/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvironmentEnum, LoggerUtil } from '@nx-nestjs-prisma-template/shared';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const environment = config.get<EnvironmentEnum>('environment');
  const port = config.get<number>('port');

  app.useLogger(LoggerUtil.getLogger(environment));
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(port, async () => {
    Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
    Logger.log(`Environment: ${environment}`);
  });
}

bootstrap();
