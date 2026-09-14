import fs from 'fs';
import path from 'path';
import type { LocalSourceOptions, ProfileSource } from '../contracts';
import { validateFilename } from '../profiles/validateFilename';

export const localSource: ProfileSource<LocalSourceOptions> = {
  async resolve(options) {
    const source = path.resolve(options.path);
    const filename = validateFilename(
      options.filename ?? path.basename(source)
    );
    return {
      filename,
      async copyTo(destination) {
        if (source !== path.resolve(destination)) {
          fs.copyFileSync(source, destination);
        }
      },
    };
  },
};
