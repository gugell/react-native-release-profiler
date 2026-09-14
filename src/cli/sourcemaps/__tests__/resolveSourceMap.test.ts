import type { ProcessProfileOptions } from '../../contracts';
import getConfig from '../../../getConfig';
import { resolveSourceMap } from '../resolveSourceMap';
import { generateSourcemap } from '../metro';
import { androidSourceMaps } from '../android';

jest.mock('../../../getConfig', () =>
  jest.fn(async () => ({ root: '/project' }))
);
jest.mock('../../../getMetroBundleOptions', () => ({
  getMetroBundleOptions: () => ({
    platform: 'android',
    dev: true,
    minify: false,
    host: 'localhost',
  }),
}));
jest.mock('../metro', () => ({
  generateSourcemap: jest.fn(async () => '/metro.map'),
}));
jest.mock('../android', () => ({
  androidSourceMaps: { find: jest.fn(async () => undefined) },
}));
const base: ProcessProfileOptions = {
  input: { kind: 'local', options: { path: 'profile' } },
  platform: 'android',
  outputDirectory: '.',
  format: 'chrome',
  generateSourcemap: false,
  port: 8081,
};
beforeEach(() => jest.clearAllMocks());

test('explicit map bypasses project lookup and Metro', async () => {
  expect(
    await resolveSourceMap(
      { ...base, sourcemapPath: '/explicit.map' },
      'profile'
    )
  ).toBe('/explicit.map');
  expect(getConfig).not.toHaveBeenCalled();
  expect(generateSourcemap).not.toHaveBeenCalled();
});

test('prefers an Android build map over Metro', async () => {
  (androidSourceMaps.find as jest.Mock).mockResolvedValueOnce('/android.map');
  expect(await resolveSourceMap(base, 'profile')).toBe('/android.map');
  expect(generateSourcemap).not.toHaveBeenCalled();
});

test('explicit generation skips build lookup', async () => {
  expect(
    await resolveSourceMap({ ...base, generateSourcemap: true }, 'profile')
  ).toBe('/metro.map');
  expect(getConfig).not.toHaveBeenCalled();
  expect(androidSourceMaps.find).not.toHaveBeenCalled();
});

test('iOS requests an iOS map without loading Android config', async () => {
  await resolveSourceMap({ ...base, platform: 'ios' }, 'profile');
  expect(getConfig).not.toHaveBeenCalled();
  expect(androidSourceMaps.find).not.toHaveBeenCalled();
  expect(generateSourcemap).toHaveBeenCalledWith(
    '8081',
    expect.objectContaining({ platform: 'ios' })
  );
});
