import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
    }),
    DataLayerModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
