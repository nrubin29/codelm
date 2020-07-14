module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'codelm',
      script: 'dist/bundle.js',
      args: '--debug', // Enable for debug mode (necessary for stress testing)
      env: {},
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
