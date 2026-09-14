import type { ProcessProfileOptions, ProfileInput } from './contracts';

export interface CLIOptions {
  platform?: string;
  device?: string;
  appId?: string;
  appIdSuffix?: string;
  filename?: string;
  local?: string;
  fromDownload?: boolean;
  raw?: boolean;
  sourcemapPath?: string;
  generateSourcemap?: boolean;
  port?: string;
}

export function parseOptions(
  options: CLIOptions,
  outputDirectory = '.'
): ProcessProfileOptions {
  const platform = options.platform ?? 'android';
  if (platform !== 'android' && platform !== 'ios')
    throw new Error('--platform must be android or ios.');
  if (platform === 'ios' && !options.local && options.fromDownload) {
    throw new Error(
      '--fromDownload is Android-only. iOS profiles are stored in Library/Caches.'
    );
  }
  const port = Number(options.port ?? '8081');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('--port must be an integer between 1 and 65535.');
  let input: ProfileInput;
  if (options.local) {
    input = {
      kind: 'local',
      options: { path: options.local, filename: options.filename },
    };
  } else if (platform === 'ios') {
    input = {
      kind: 'ios',
      options: {
        bundleId: options.appId
          ? [options.appId, options.appIdSuffix].filter(Boolean).join('.')
          : '',
        device: options.device,
        filename: options.filename,
      },
    };
  } else {
    input = {
      kind: 'android',
      options: {
        appId: options.appId,
        appIdSuffix: options.appIdSuffix,
        filename: options.filename,
        location: options.fromDownload ? 'downloads' : 'cache',
      },
    };
  }
  return {
    input,
    platform,
    outputDirectory,
    format: options.raw ? 'hermes' : 'chrome',
    sourcemapPath: options.sourcemapPath,
    generateSourcemap: options.generateSourcemap ?? false,
    port,
  };
}
