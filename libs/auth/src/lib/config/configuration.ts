export const configuration = () => ({
  jwtSecretKey: {
    ignoreExpiration: process.env['JWT_IGNORE_EXPIRATION'],
    access: process.env['JWT_SECRET_KEY'],
    refresh: process.env['JWT_REFRESH_KEY'],
    expiresIn: process.env['JWT_EXPIRES_IN'],
  },
  hasGoogleAuth: process.env['HAS_GOOGLE_AUTH'] === 'true',
  google: {
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: process.env['GOOGLE_CALLBACK_URL'],
  },
  hasFacebookAuth: process.env['HAS_FACEBOOK_AUTH'] === 'true',
  facebook: {
    appId: process.env['FACEBOOK_APP_ID'],
    appSecret: process.env['FACEBOOK_APP_SECRET'],
    callbackURL: process.env['FACEBOOK_CALLBACK_URL'],
  },
  frontendUrl: process.env['FRONTEND_URL'],
});
