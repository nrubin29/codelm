const webpackMerge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = webpackMerge.merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
});
