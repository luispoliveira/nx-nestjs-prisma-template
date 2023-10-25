export const configuration = () => ({
  admin: {
    password: process.env['ADMIN_PASSWORD'],
    email: process.env['ADMIN_EMAIL'],
  },
});
