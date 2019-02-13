#!/usr/bin/env node

const metadata = require('../package.json')

import caporal from 'caporal'
import { LogProvider } from './lib/LogProvider'
import { InitCommand } from './commands/InitCommand'

// const allowedObjects = [
//   'lib',
//   'error',
//   'domain',
//   'service',
//   'repository',
//   'config',
//   'connection',
//   'event',
//   'route'
// ]

caporal.version(metadata.version)

/**
 * INIT
 */
caporal
  .command('init', 'Start a fresh new installation of your project')
  .argument('<projectName>', 'Project name')
  .option('--dir <folderPath>', 'Folder to create structure')
  .option('--domains <domains>', 'A comma-separated list of domains to initialize (PascalCase, camelCase, kebab-case or snake_case)', caporal.LIST)
  .action((args, option, logger) => {
    const logProvider = new LogProvider(logger)
    const initCommand = new InitCommand(logProvider)
    return initCommand.execute(args, option)
  })

caporal.parse(process.argv)
