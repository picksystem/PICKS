import webpack, { type Configuration } from 'webpack';
import { loadPartnerEnv } from './env-loader';
import { PartnerWebpackPlugin } from './partner-webpack-plugin';

export function extendWebpack(
  config: Configuration,
  context: { options: { root: string } },
): Configuration {
  const partnerConfig = loadPartnerEnv(context.options.root);

  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};

  config.plugins = config.plugins || [];

  // Add partner webpack plugin for file overrides
  config.plugins.push(new PartnerWebpackPlugin(partnerConfig.partner));

  // Inject partner config as global variables accessible throughout the app
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.PARTNER': JSON.stringify(partnerConfig.partner),
      'process.env.PARTNER_ID': JSON.stringify(partnerConfig.partnerId),
      'process.env.PARTNER_NAME': JSON.stringify(partnerConfig.partnerName),
      __PARTNER_CONFIG__: JSON.stringify(partnerConfig),
    }),
  );

  return config;
}
