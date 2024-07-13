import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EnvironmentEnum, LoggerUtil } from '@nx-nestjs-prisma-template/shared';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);

  const environment = config.get<EnvironmentEnum>('environment');

  if (!environment) throw new Error('environment is not defined');

  app.useLogger(LoggerUtil.getLogger(environment));
  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.error(error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
