const metadata = require('../package.json')

import caporal from 'caporal'



caporal.version(metadata.version)

/**
 * INIT
 */
caporal
  .command('init', 'Start a fresh new installation of your project')
  .argument('<name>', 'Project name')
  .action((args, option, logger) => {

  })

caporal.parse(process.argv)