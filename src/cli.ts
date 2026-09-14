#!/usr/bin/env node
import { logger } from '@react-native-community/cli-tools';
import { parseOptions } from './cli/options';
import { processProfile } from './cli/processProfile';

if (require.main === module) {
  const { program } = require('commander');

  program
    .option('--platform <string>', 'Device platform: android or ios', 'android')
    .option(
      '--device <string>',
      'iOS device identifier or name (auto-selected when only one is available)'
    )
    .option(
      '--filename <string>',
      'Profile basename (required for iOS device downloads)'
    )
    .option('--sourcemap-path <string>')
    .option('--generate-sourcemap')
    .option('--port <number>')
    .option('--appId <string>')
    .option('--appIdSuffix <string>')
    .option('--fromDownload')
    .option('--raw')
    .option('--local <string>');

  program.parse();

  const run = async () => {
    const result = await processProfile(parseOptions(program.opts()));
    logger.success(
      `Successfully ${
        result.format === 'hermes'
          ? 'pulled the file'
          : 'converted to Chrome tracing format'
      } to ${result.outputPath}`
    );
  };
  run().catch((error: Error) => {
    logger.error(error.message);
    process.exitCode = 1;
  });
}
