import fs from 'fs';
import os from 'os';
import path from 'path';
import { localSource } from '../local';

test('copies local input without changing its contents, including a same-path copy', async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'local-profile-test-')
  );
  try {
    const input = path.join(directory, 'input.cpuprofile');
    const output = path.join(directory, 'output.cpuprofile');
    fs.writeFileSync(input, 'original bytes');
    const source = await localSource.resolve({ path: input });
    expect(source.filename).toBe('input.cpuprofile');
    await source.copyTo(input);
    await source.copyTo(output);
    expect(fs.readFileSync(input, 'utf8')).toBe('original bytes');
    expect(fs.readFileSync(output, 'utf8')).toBe('original bytes');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
