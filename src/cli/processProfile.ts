import fs from 'fs';
import os from 'os';
import path from 'path';
import type { ProcessProfileOptions, ProcessProfileResult } from './contracts';
import { resolveProfile } from './sources';
import { normalizeProfile } from './profiles/normalizeProfile';
import { convertProfile } from './profiles/convertProfile';
import { validateFilename } from './profiles/validateFilename';
import { resolveSourceMap } from './sourcemaps/resolveSourceMap';

export async function processProfile(
  options: ProcessProfileOptions,
  resolveSource: typeof resolveProfile = resolveProfile
): Promise<ProcessProfileResult> {
  const profile = await resolveSource(options.input);
  const filename = validateFilename(profile.filename);
  const outputPath = path.resolve(
    options.outputDirectory,
    options.format === 'hermes'
      ? filename
      : `${path.basename(filename, '.cpuprofile')}-converted.json`
  );
  const temporaryDirectory =
    options.format === 'chrome'
      ? fs.mkdtempSync(path.join(os.tmpdir(), 'release-profiler-'))
      : undefined;
  try {
    const localPath = temporaryDirectory
      ? path.join(temporaryDirectory, filename)
      : outputPath;
    await profile.copyTo(localPath);
    // Preserve existing --raw normalization as well as conversion behavior.
    normalizeProfile(localPath);
    if (options.format === 'chrome') {
      const sourcemap = await resolveSourceMap(options, localPath);
      await convertProfile(localPath, outputPath, sourcemap);
    }
    return { outputPath, format: options.format };
  } finally {
    if (temporaryDirectory)
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}
