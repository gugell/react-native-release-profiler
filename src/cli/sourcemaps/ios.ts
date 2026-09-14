import type { BuildSourceMapLocator } from '../contracts';

// Xcode build paths are not inferred. Supply the matching map or use Metro.
export const iosSourceMaps: BuildSourceMapLocator = {
  async find() {
    return undefined;
  },
};
