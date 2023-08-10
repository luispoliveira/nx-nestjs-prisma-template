export const configuration = () => ({
  admin: {
    username: process.env['ADMIN_USERNAME'],
    password: process.env['ADMIN_PASSWORD'],
    email: process.env['ADMIN_EMAIL'],
  },
});
