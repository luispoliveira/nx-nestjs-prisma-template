import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { EnvironmentEnum } from '@nx-nestjs-prisma-template/shared';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { GraphqlResolver } from './graphql.resolver';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    GraphQLModule.forRoot({
      debug: process.env['ENVIRONMENT'] === EnvironmentEnum.Development,
      playground: false,
      driver: ApolloDriver,
      plugins:
        process.env['ENVIRONMENT'] === EnvironmentEnum.Production
          ? [ApolloServerPluginLandingPageProductionDefault()]
          : [ApolloServerPluginLandingPageLocalDefault()],
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      persistedQueries: false,
      autoSchemaFile: true,
      sortSchema: true,
    }),
  ],
  controllers: [],
  providers: [GraphqlResolver],
  exports: [],
})
export class GraphqlModule {}
