import chalk from 'chalk'
import { LogLevels } from '../structures/LogLevels'

export class logger {

  private readonly logger


  constructor (logger: Logger) {
    this.logger = logger
  }

  private resolveLevel (text: string, level: LogLevels) {
    return {
      [LogLevels.COMMON]: text,
      [LogLevels.ERROR]: chalk.redBright(text),
      [LogLevels.INFO]: chalk.cyanBright(text),
      [LogLevels.SUCCESS]: chalk.green(text),
      [LogLevels.WARNING]: chalk.yellow(text)
    }[level]
  }

  title (text: any, level: LogLevels) {

  }
}