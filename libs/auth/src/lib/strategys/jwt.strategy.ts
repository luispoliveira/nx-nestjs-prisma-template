import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '@nx-nestjs-prisma-template/data-layer';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadType } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: configService.get('jwtSecretKey').ignoreExpiration,
      secretOrKey: configService.get('jwtSecretKey').access,
    });
  }

  async validate(payload: JwtPayloadType) {
    const { userId } = payload;

    const user = await this.usersService.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new UnauthorizedException();
    return {
      ...user,
      permissions: payload.permissions,
      roles: payload.roles,
    };
  }
}
