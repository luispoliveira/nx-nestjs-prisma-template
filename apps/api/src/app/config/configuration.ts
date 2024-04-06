export const configuration = () => ({
  port: parseInt(process.env['PORT'], 10) || 3000,
});
