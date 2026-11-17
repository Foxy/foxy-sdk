/* eslint-disable @typescript-eslint/no-var-requires */

const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    Customer: './src/customer/index.ts',
  },

  mode: 'production',

  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },

  output: {
    filename: 'FoxySDK[name].js',
    library: ['FoxySDK', '[name]'],
    libraryTarget: 'umd',
    path: path.join(__dirname, './dist/cdn'),
  },

  plugins: [
    /** uses the browser version of the proxy agent lookup (no Node-only dependencies) */
    new webpack.NormalModuleReplacementPlugin(/getProxyAgent\.js$/, resource => {
      resource.request = resource.request.replace(/getProxyAgent\.js$/, 'getProxyAgent.browser.js');
    }),

    /** allows processing .js import paths with ts-loader */
    new webpack.NormalModuleReplacementPlugin(/(.*)\.js/, resource => {
      if (!resource.context.includes('node_modules')) {
        resource.request = resource.request.replace(/(.*)\.js/, '$1.ts');
      }
    }),
  ],

  resolve: {
    extensions: ['.ts'],
  },

  target: 'web',
};
