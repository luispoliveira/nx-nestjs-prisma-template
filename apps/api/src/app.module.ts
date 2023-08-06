import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { GraphqlModule } from '@nx-nestjs-prisma-template/graphql';
import { AppService } from './app.service';
import { LocalAuthModule } from './auth/local-auth.module';
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
    GraphqlModule,
    LocalAuthModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
