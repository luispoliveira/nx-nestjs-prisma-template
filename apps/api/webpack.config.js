
const { composePlugins, withNx} = require('@nx/webpack');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    const hasSentry = process.env.SENTRY_AUTH_TOKEN !== undefined;

    if (hasSentry) {
      config.plugins.push(
        sentryWebpackPlugin({
          org: 'targx-jw',
          project: 'nx-nestjs-prisma-template',
          authToken: process.env.SENTRY_AUTH_TOKEN,
          include: './dist',
          ignore: ['node_modules', 'webpack.config.js'],
        }),
      );

      config.devtool = 'source-map';
    }
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    return config;
  },
);

