import { execSync } from 'child_process';
import getConfig from '../../../getConfig';
import { androidSource } from '../android';

jest.mock('child_process', () => ({ execSync: jest.fn() }));
jest.mock('../../../getConfig', () =>
  jest.fn(async () => ({
    project: { android: { packageName: 'com.test' } },
    root: '.',
  }))
);
beforeEach(() => jest.clearAllMocks());

test('resolves the newest profile and ignores directories and unrelated files', async () => {
  (execSync as jest.Mock).mockReturnValue(
    Buffer.from('images/\nnewest.txt\nlatest.cpuprofile\nolder.cpuprofile\n')
  );
  const profile = await androidSource.resolve({
    location: 'cache',
    appIdSuffix: 'debug',
  });
  expect(profile.filename).toBe('latest.cpuprofile');
  expect(getConfig).toHaveBeenCalledTimes(1);
  expect(execSync).toHaveBeenCalledWith(
    expect.stringContaining('com.test.debug')
  );
});

test('does not discover a file or load project config when both are explicit', async () => {
  const profile = await androidSource.resolve({
    location: 'downloads',
    appId: 'com.test',
    filename: 'trace.cpuprofile',
  });
  expect(execSync).not.toHaveBeenCalled();
  expect(getConfig).not.toHaveBeenCalled();
  await profile.copyTo('/tmp/output with spaces.cpuprofile');
  expect(execSync).toHaveBeenCalledWith(
    expect.stringContaining(" > '/tmp/output with spaces.cpuprofile'")
  );
});

test('reports an empty recording directory', async () => {
  (execSync as jest.Mock).mockReturnValue(Buffer.from('images/\n'));
  await expect(
    androidSource.resolve({ location: 'cache', appId: 'com.test' })
  ).rejects.toThrow('Record a profile first');
});
