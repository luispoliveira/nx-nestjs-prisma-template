import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { ApiKeyStrategy } from './strategys/api-key.strategy';
import { JwtStrategy } from './strategys/jwt.strategy';

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
  ],
  providers: [JwtStrategy, ApiKeyStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
