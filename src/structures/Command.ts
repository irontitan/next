import { LogProvider } from '../lib/LogProvider'
import path from 'path'

export abstract class Command {
  protected readonly logger: LogProvider
  protected readonly templatesFolder: string = path.resolve(path.join(__dirname, '/../../templates'))

  constructor (logger: LogProvider) {
    this.logger = logger
  }

  abstract execute (args, options)
}
