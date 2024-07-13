export const configuration = () => ({
  port: parseInt(process.env['PORT'], 10) || 3000,
  frontendUrl: process.env['FRONTEND_URL'],
});
