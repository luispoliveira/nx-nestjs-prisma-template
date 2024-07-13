export const configuration = () => ({
  databaseUrl: process.env['DATABASE_URL'],
  environment: process.env['ENVIRONMENT'],
  logPrisma: process.env['LOG_PRISMA'] === 'true',
});
