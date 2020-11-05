/* eslint-disable @typescript-eslint/no-var-requires */

const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    Admin: './src/admin/index.ts',
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

  resolve: {
    extensions: ['.ts', '.js'],
  },

  target: 'web',
};
