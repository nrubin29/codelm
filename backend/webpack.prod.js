const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = webpackMerge.merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
});
