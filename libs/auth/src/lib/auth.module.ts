import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { RbacService } from './services/rbac.service';
import { ApiKeyStrategy } from './strategys/api-key.strategy';
import { GoogleStrategy } from './strategys/google.strategy';
import { JwtStrategy } from './strategys/jwt.strategy';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('jwtSecretKey').access,
          signOptions: {
            expiresIn: configService.get('jwtSecretKey').expiresIn,
          },
        };
      },
    }),
    DataLayerModule,
  ],
  providers: [JwtStrategy, ApiKeyStrategy, RbacService, GoogleStrategy],
  exports: [JwtModule, RbacService],
})
export class AuthModule {}
