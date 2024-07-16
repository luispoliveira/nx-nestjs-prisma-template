export const configuration = () => ({
  port: parseInt(process.env['PORT'], 10) || 3000,
  frontendUrl: process.env['FRONTEND_URL'],
  hasSentry: process.env['HAS_SENTRY'] === 'true',
  sentryDsn: process.env['SENTRY_DSN'],
});
