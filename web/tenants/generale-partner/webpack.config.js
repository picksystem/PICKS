const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { PartnerWebpackPlugin } = require('../../../tools/webpack/partner-webpack-plugin');
const { loadPartnerEnv } = require('../../../tools/webpack/env-loader');

// HARDCODED partner for this app
const PARTNER = 'generale-partner';
const APP_NAME = 'administration';

console.log('🔵 Building Generale Partner App');
console.log('📦 PARTNER:', PARTNER);
console.log('🏷️  APP_NAME:', APP_NAME);

process.env.PARTNER = PARTNER;

// Load partner configuration
const partnerConfig = loadPartnerEnv(path.resolve(__dirname, '../../..'));

module.exports = {
  entry: path.resolve(__dirname, '../../apps/administration/src/main.tsx'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],

    alias: {
      '@picks/component': path.resolve(__dirname, '../../../libs/ui/components'),
      '@picks/theme': path.resolve(__dirname, '../../../libs/theme/index.ts'),
      '@picks/interfaces': path.resolve(__dirname, '../../../libs/entities/index.ts'),
      '@picks/store': path.resolve(__dirname, '../../../libs/ui/store/index.ts'),
      '@picks/hooks': path.resolve(__dirname, '../../../libs/ui/hooks/index.ts'),
      '@picks/utils': path.resolve(__dirname, '../../../libs/utils/index.ts'),
      '@picks/services': path.resolve(__dirname, '../../../libs/services/index.ts'),
      '@picks/pages/admin': path.resolve(__dirname, '../../../libs/ui/pages/admin'),
      '@picks/pages/user': path.resolve(__dirname, '../../../libs/ui/pages/user'),
      '@picks/pages/consultant': path.resolve(__dirname, '../../../libs/ui/pages/consultant'),
      '@picks/pages/shared': path.resolve(__dirname, '../../../libs/ui/pages/shared'),
      'libs/ui/state': path.resolve(__dirname, '../../../libs/ui/state/index.ts'),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new PartnerWebpackPlugin(PARTNER),
    new webpack.DefinePlugin({
      APP_NAME: JSON.stringify(APP_NAME),
      PARTNER: JSON.stringify(PARTNER),
      'process.env.PARTNER': JSON.stringify(partnerConfig.partner || PARTNER),
      'process.env.PARTNER_ID': JSON.stringify(partnerConfig.partnerId),
      'process.env.PARTNER_NAME': JSON.stringify(partnerConfig.partnerName),
      __PARTNER_CONFIG__: JSON.stringify(partnerConfig),
    }),
  ],

  devServer: {
    static: path.resolve(__dirname, '../../apps/administration/src'),
    hot: true,
    port: 1700,
    historyApiFallback: true,
  },

  mode: 'development',
};
