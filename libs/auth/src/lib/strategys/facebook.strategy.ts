import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { VerifyCallback } from 'passport-google-oauth2';
import { OauthDataType } from '../types/oauth.type';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly _configService: ConfigService) {
    const facebookConfig = _configService.get('facebook');

    super({
      clientID: facebookConfig.appId,
      clientSecret: facebookConfig.appSecret,
      callbackURL: facebookConfig.callbackURL,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails } = profile;

    if (!emails || !emails[0].value)
      return done(new Error('Email not found in facebook profile'), null);

    if (!name || !name.givenName || !name.familyName)
      return done(new Error('Name not found in facebook profile'), null);

    const user: OauthDataType = {
      email: emails[0].value,
      provider: 'facebook',
      providerId: profile.id,
      profile: {
        firstName: name.givenName,
        lastName: name.familyName,
      },
    };

    done(null, user);
  }
}
