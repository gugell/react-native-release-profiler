import fs from 'fs';
import os from 'os';
import path from 'path';
import type { ProcessProfileOptions, ResolvedProfile } from '../contracts';
import { processProfile } from '../processProfile';

let directory: string;
beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-test-'));
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

function options(format: 'hermes' | 'chrome'): ProcessProfileOptions {
  return {
    input: { kind: 'local', options: { path: 'unused' } },
    platform: 'ios',
    outputDirectory: directory,
    format,
    generateSourcemap: false,
    port: 8081,
  };
}

test('normalizes a resolved source without invoking device or project tools', async () => {
  const source: ResolvedProfile = {
    filename: 'sample.cpuprofile',
    async copyTo(destination) {
      fs.writeFileSync(
        destination,
        JSON.stringify({
          stackFrames: { 1: { funcVirtAddr: '20', offset: '2' } },
        })
      );
    },
  };
  const result = await processProfile(options('hermes'), async () => source);
  expect(result).toEqual({
    format: 'hermes',
    outputPath: path.join(directory, 'sample.cpuprofile'),
  });
  expect(
    JSON.parse(fs.readFileSync(result.outputPath, 'utf8')).stackFrames[1]
  ).toEqual({ line: '1', column: '23' });
});

test.each(['copy', 'normalize'])(
  'cleans up the temporary file when %s fails',
  async (stage) => {
    let copyPath = '';
    await expect(
      processProfile(options('chrome'), async () => ({
        filename: 'sample.cpuprofile',
        async copyTo(destination) {
          copyPath = destination;
          fs.writeFileSync(destination, 'invalid JSON');
          if (stage === 'copy') throw new Error('copy failed');
        },
      }))
    ).rejects.toThrow();
    expect(fs.existsSync(path.dirname(copyPath))).toBe(false);
    expect(fs.readdirSync(directory)).toEqual([]);
  }
);

test('rejects an unsafe filename returned by a source before copying', async () => {
  const copyTo = jest.fn();
  await expect(
    processProfile(options('hermes'), async () => ({
      filename: '../escape.cpuprofile',
      copyTo,
    }))
  ).rejects.toThrow('basename');
  expect(copyTo).not.toHaveBeenCalled();
});
