import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { extendWebpack } from './tools/webpack/extend-webpack';

export default composePlugins(withNx(), withReact(), extendWebpack);
