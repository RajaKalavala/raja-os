import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default (async () => {
  const mfConfig = await withModuleFederation(
    {
      ...config,
    },
    { dts: false }
  );

  return (webpackConfig: any) => {
    const result = mfConfig(webpackConfig);
    // Set publicPath to auto so assets are loaded relative to the remote's location
    result.output = {
      ...result.output,
      publicPath: 'auto',
    };
    return result;
  };
})();
