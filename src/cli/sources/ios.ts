import { execFileSync } from 'child_process';
import type { IOSSourceOptions, ProfileSource } from '../contracts';
import { resolveIOSDevice } from './iosDevice';
import { validateFilename } from '../profiles/validateFilename';

export const iosSource: ProfileSource<IOSSourceOptions> = {
  async resolve(options) {
    if (process.platform !== 'darwin') {
      throw new Error(
        'iOS device downloads require macOS and Xcode with devicectl.'
      );
    }
    if (!options.bundleId) {
      throw new Error(
        'Provide --appId with the installed iOS app bundle identifier.'
      );
    }
    if (
      !options.filename ||
      options.filename.includes('/') ||
      options.filename.includes('\\') ||
      !options.filename.endsWith('.cpuprofile')
    ) {
      throw new Error(
        'Provide --filename with the .cpuprofile basename returned by stopProfiling(), not its full path.'
      );
    }

    const filename = validateFilename(options.filename!);
    const selectedDevice = resolveIOSDevice(options.device);
    return {
      filename,
      async copyTo(destination) {
        execFileSync(
          'xcrun',
          [
            'devicectl',
            'device',
            'copy',
            'from',
            '--device',
            selectedDevice,
            '--domain-type',
            'appDataContainer',
            '--domain-identifier',
            options.bundleId,
            '--source',
            `Library/Caches/${filename}`,
            '--destination',
            destination,
          ],
          { stdio: 'inherit' }
        );
      },
    };
  },
};
