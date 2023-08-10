export const configuration = () => ({
  jwtSecretKey: {
    ignoreExpiration: process.env['JWT_IGNORE_EXPIRATION'],
    access: process.env['JWT_SECRET_KEY'],
    refresh: process.env['JWT_REFRESH_KEY'],
    expiresIn: process.env['JWT_EXPIRES_IN'],
  },
});
