import { logger } from '@react-native-community/cli-tools';
import getConfig from '../../getConfig';
import { getMetroBundleOptions } from '../../getMetroBundleOptions';
import type { ProcessProfileOptions } from '../contracts';
import { androidSourceMaps } from './android';
import { iosSourceMaps } from './ios';
import { generateSourcemap } from './metro';

const locators = { android: androidSourceMaps, ios: iosSourceMaps };

export async function resolveSourceMap(
  options: ProcessProfileOptions,
  profilePath: string
): Promise<string | undefined> {
  if (options.sourcemapPath) return options.sourcemapPath;

  if (!options.generateSourcemap) {
    const projectRoot =
      options.platform === 'android'
        ? (await getConfig())?.root ?? process.cwd()
        : process.cwd();
    const map = await locators[options.platform].find(projectRoot);
    if (map) return map;
  }
  const bundleOptions = getMetroBundleOptions(profilePath, 'localhost');
  if (options.platform === 'ios') bundleOptions.platform = 'ios';
  const map = await generateSourcemap(String(options.port), bundleOptions);
  if (!map) {
    logger.warn('Cannot find source maps, running the transformer without it');
    logger.info(
      'Provide --sourcemap-path with the source map from the profiled build.'
    );
  }
  return map;
}
