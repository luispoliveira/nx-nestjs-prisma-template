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
    const extractJwt = (req: any) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      jwtFromRequest: extractJwt,
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
