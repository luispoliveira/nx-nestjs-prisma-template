import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FacebookOauthGuard,
  GoogleOauthGuard,
  OauthDataType,
} from '@nx-nestjs-prisma-template/auth';
import { Response } from 'express';
import { LocalAuthService } from './local-auth.service';

@Controller('auth')
export class LocalAuthController {
  constructor(
    private readonly _localAuthService: LocalAuthService,
    private readonly _configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async authGoogle() {}

  @Get('facebook')
  @UseGuards(FacebookOauthGuard)
  async authFacebook() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user as OauthDataType;
    const token = await this._localAuthService.loginOAuth(user);

    res.cookie('accessToken', token.accessToken, {
      maxAge: 7 * 60 * 60 * 1000,
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
    });

    const frontendUrl = this._configService.get<string>('frontendUrl');

    return res.status(200).redirect(frontendUrl);
  }

  @Get('facebook/callback')
  @UseGuards(FacebookOauthGuard)
  async facebookAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user as OauthDataType;
    const token = await this._localAuthService.loginOAuth(user);

    res.cookie('accessToken', token.accessToken, {
      maxAge: 7 * 60 * 60 * 1000,
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
    });

    const frontendUrl = this._configService.get<string>('frontendUrl');

    return res.status(200).redirect(frontendUrl);
  }
}
