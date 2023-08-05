/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvironmentEnum, LoggerUtil } from '@nx-nestjs-prisma-template/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const environment = config.get<EnvironmentEnum>('NODE_ENV');
  const port = config.get<number>('PORT');

  const globalPrefix = config.get<string>('GLOBAL_PREFIX');

  app.useLogger(LoggerUtil.getLogger(environment));

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.setGlobalPrefix(globalPrefix);

  await app.listen(port, async () => {
    Logger.log(`Server running on ${await app.getUrl()}`);
    Logger.log(`GraphQL at http://localhost:${port}/graphql`);
    Logger.log(`Environment: ${environment}`);
  });
}

bootstrap();
