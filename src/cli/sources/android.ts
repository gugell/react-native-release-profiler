import { execSync } from 'child_process';
import { logger } from '@react-native-community/cli-tools';
import getConfig from '../../getConfig';
import type { AndroidSourceOptions, ProfileSource } from '../contracts';
import { validateFilename } from '../profiles/validateFilename';

// adb shell receives a shell command too; quote each path before composing it.
function quote(value: string): string {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

export const androidSource: ProfileSource<AndroidSourceOptions> = {
  async resolve(options) {
    const config = options.appId ? null : await getConfig();
    const appId = [
      options.appId || config?.project.android?.packageName,
      options.appIdSuffix,
    ]
      .filter(Boolean)
      .join('.');
    if (!appId) {
      throw new Error(
        "Failed to retrieve the package name from the project's Android manifest file. Please provide the package name with the --appId flag."
      );
    }
    const directory =
      options.location === 'downloads' ? '/sdcard/Download' : 'cache';
    const remotePrefix =
      options.location === 'downloads' ? '' : `run-as ${quote(appId)} `;
    const selectedFilename =
      options.filename ||
      execSync(
        `adb shell ${quote(`${remotePrefix}ls ${quote(directory + '/')} -tp`)}`
      )
        .toString()
        .split(/\r?\n/)
        .find((entry) => entry.endsWith('.cpuprofile'));
    if (!selectedFilename) {
      throw new Error(
        'There is no .cpuprofile in the selected directory. Record a profile first.'
      );
    }
    const filename = validateFilename(selectedFilename);
    return {
      filename,
      async copyTo(destination) {
        const command = `adb shell ${quote(
          `${remotePrefix}cat ${quote(directory + '/' + filename)}`
        )} > ${quote(destination)}`;
        logger.debug(command);
        execSync(command);
      },
    };
  },
};
