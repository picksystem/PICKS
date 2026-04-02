const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/main.tsx'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],

    alias: {
      '@serviceops/component': path.resolve(__dirname, '../../libs/shared/src/index.ts'),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],

  devServer: {
    static: path.resolve(__dirname, 'src'),
    hot: true,
    port: 4300,
  },

  mode: 'development',
};
