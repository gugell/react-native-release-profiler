import type { ProfileInput, ResolvedProfile } from '../contracts';
import { androidSource } from './android';
import { iosSource } from './ios';
import { localSource } from './local';

export function resolveProfile(input: ProfileInput): Promise<ResolvedProfile> {
  switch (input.kind) {
    case 'android':
      return androidSource.resolve(input.options);
    case 'ios':
      return iosSource.resolve(input.options);
    case 'local':
      return localSource.resolve(input.options);
  }
}
