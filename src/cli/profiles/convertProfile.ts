import fs from 'fs';
import transformer from '@margelo/hermes-profile-transformer';

export async function convertProfile(
  input: string,
  output: string,
  sourcemapPath?: string
): Promise<void> {
  const events = await transformer(input, sourcemapPath, 'index.bundle');
  // Serialize individual events to preserve support for large traces.
  const contents = events
    .map((event) => JSON.stringify(event, undefined, 4))
    .join(',');
  fs.writeFileSync(output, '[' + contents + ']', 'utf8');
}
