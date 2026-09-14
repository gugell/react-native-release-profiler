import fs from 'fs';
import path from 'path';
import type { BuildSourceMapLocator } from '../contracts';

export const androidSourceMaps: BuildSourceMapLocator = {
  async find(projectRoot) {
    const build = path.join(projectRoot, 'android', 'app', 'build');
    return [
      path.join(
        build,
        'generated',
        'sourcemaps',
        'react',
        'debug',
        'index.android.bundle.map'
      ),
      path.join(
        build,
        'intermediates',
        'sourcemaps',
        'react',
        'debug',
        'index.android.bundle.packager.map'
      ),
    ].find((candidate) => fs.existsSync(candidate));
  },
};
