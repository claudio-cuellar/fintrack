const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'expenses',
  exposes: {
    './Routes': './src/app/remote.routes.ts',
  },
  shared: {
    '@fintrack/shared': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
  features: { ignoreUnusedDeps: true },
});
