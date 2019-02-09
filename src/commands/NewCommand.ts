import { Command } from '../structures/Command'
import { LogProvider } from '../lib/LogProvider'
export class NewCommand extends Command {
  constructor (logger: LogProvider) {
    super(logger)
  }

  execute (_args: any, _options: any) {
    this.logger.info().title('new')
  }

}