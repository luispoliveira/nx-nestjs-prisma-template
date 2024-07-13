import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import {
  GoogleOauthDataType,
  GoogleOauthGuard,
} from '@nx-nestjs-prisma-template/auth';
import { Response } from 'express';
import { LocalAuthService } from './local-auth.service';

@Controller('auth')
export class LocalAuthController {
  constructor(private readonly _localAuthService: LocalAuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user as GoogleOauthDataType;
    const token = await this._localAuthService.loginGoogle(user);

    res.cookie('access_token', token.accessToken, {
      maxAge: 7 * 60 * 60 * 1000,
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).redirect(process.env.FRONTEND_URL);
  }
}
