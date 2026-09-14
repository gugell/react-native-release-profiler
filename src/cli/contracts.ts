export type Platform = 'android' | 'ios';

/** A source resolves one recording; only the pipeline chooses its local destination. */
export interface ResolvedProfile {
  filename: string;
  copyTo(destination: string): Promise<void>;
}

export interface ProfileSource<Options> {
  resolve(options: Options): Promise<ResolvedProfile>;
}

export interface AndroidSourceOptions {
  appId?: string;
  appIdSuffix?: string;
  filename?: string;
  location: 'cache' | 'downloads';
}

export interface IOSSourceOptions {
  bundleId: string;
  device?: string;
  filename?: string;
}

export interface LocalSourceOptions {
  path: string;
  filename?: string;
}

export type ProfileInput =
  | { kind: 'android'; options: AndroidSourceOptions }
  | { kind: 'ios'; options: IOSSourceOptions }
  | { kind: 'local'; options: LocalSourceOptions };

export interface ProcessProfileOptions {
  input: ProfileInput;
  platform: Platform;
  outputDirectory: string;
  format: 'hermes' | 'chrome';
  sourcemapPath?: string;
  generateSourcemap: boolean;
  port: number;
}

export interface ProcessProfileResult {
  outputPath: string;
  format: 'hermes' | 'chrome';
}

export interface BuildSourceMapLocator {
  find(projectRoot: string): Promise<string | undefined>;
}
