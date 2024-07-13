import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { TwilioService } from './twilio.service';

@Global()
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class TwilioModule {
  static register(): DynamicModule {
    return {
      module: TwilioModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          validationSchema,
        }),
      ],
      providers: [TwilioService],
      exports: [TwilioService],
    };
  }
}
