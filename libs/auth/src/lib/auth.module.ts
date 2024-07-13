import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DataLayerModule } from '@nx-nestjs-prisma-template/data-layer';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { RbacService } from './services/rbac.service';
import { ApiKeyStrategy } from './strategys/api-key.strategy';
import { FacebookStrategy } from './strategys/facebook.strategy';
import { GoogleStrategy } from './strategys/google.strategy';
import { JwtStrategy } from './strategys/jwt.strategy';

@Global()
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class AuthModule {
  static register(): DynamicModule {
    const providers: Provider[] = [JwtStrategy, ApiKeyStrategy, RbacService];

    const hasGoogleAuth = process.env['HAS_GOOGLE_AUTH'] === 'true';
    const hasFacebookAuth = process.env['HAS_FACEBOOK_AUTH'] === 'true';

    if (hasGoogleAuth) providers.push(GoogleStrategy);
    if (hasFacebookAuth) providers.push(FacebookStrategy);

    return {
      module: AuthModule,
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
      providers: providers,
      exports: [JwtModule, RbacService],
    };
  }
}
