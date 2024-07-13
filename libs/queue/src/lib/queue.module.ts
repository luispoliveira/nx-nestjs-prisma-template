import { BullModule, RegisterQueueAsyncOptions } from '@nestjs/bullmq';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';

@Global()
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class QueueModule {
  static register(queuesName: string[]): DynamicModule {
    const configs: RegisterQueueAsyncOptions[] = [];

    for (const queueName of queuesName) {
      configs.push({
        imports: [ConfigModule],
        name: queueName,
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
          },
        }),
        inject: [ConfigService],
      });
    }

    return {
      module: QueueModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          validationSchema,
        }),
        BullModule.registerQueueAsync(...configs),
      ],
      providers: [],
      exports: [],
    };
  }
}
