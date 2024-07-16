/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'sentry/instrument';

import { Logger, ValidationPipe } from '@nestjs/common';
import {
  BaseExceptionFilter,
  HttpAdapterHost,
  NestFactory,
} from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentEnum, LoggerUtil } from '@nx-nestjs-prisma-template/shared';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const environment = config.get<EnvironmentEnum>('environment');
  const port = config.get<number>('port');

  app.setGlobalPrefix('api');

  app.useLogger(LoggerUtil.getLogger(environment));
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Template API')
    .setDescription('Template API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    // extraModels: [...PrismaModel.extraModels],
  });
  SwaggerModule.setup(`api/api-docs`, app, swaggerDocument);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const hasSentry = config.get<boolean>('hasSentry');
  if (hasSentry) {
    const { httpAdapter } = app.get(HttpAdapterHost);
    Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));
  }

  await app.listen(port, async () => {
    Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
    Logger.log(`Environment: ${environment}`);
  });
}

bootstrap();
