import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiKeysService } from '@nx-nestjs-prisma-template/data-layer';
import { ApiKeyUtil } from '@nx-nestjs-prisma-template/shared';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super(
      { header: 'api-key', prefix: '' },
      true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (apikey: string, done: any) => {
        const apiKey = await this.apiKeysService.findUnique({
          where: { key: ApiKeyUtil.encode(apikey) },
        });

        if (!apiKey) return done(new UnauthorizedException(), null);

        if (!apiKey.isActive) return done(new UnauthorizedException(), null);

        const currentDate = new Date();

        if (apiKey.expiresAt < currentDate)
          return done(new UnauthorizedException(), null);

        done(null, true);
      },
    );
  }
}
