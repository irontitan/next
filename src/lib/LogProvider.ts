import chalk from 'chalk'
import { LogLevels } from '../structures/LogLevels'

export class LogProvider {

  private readonly logger
  private currentLevel = LogLevels.COMMON


  constructor (logger: Logger) {
    this.logger = logger
  }

  private resolveLevel (text: string) {
    return {
      [LogLevels.COMMON]: text,
      [LogLevels.ERROR]: chalk.redBright(text),
      [LogLevels.INFO]: chalk.cyanBright(text),
      [LogLevels.SUCCESS]: chalk.green(text),
      [LogLevels.WARNING]: chalk.yellow(text)
    }[this.currentLevel]
  }

  private indent (amount: number = 1) {
    return ' '.repeat(amount)
  }

  info () {
    this.currentLevel = LogLevels.INFO
    return this
  }

  warn () {
    this.currentLevel = LogLevels.WARNING
    return this
  }

  error () {
    this.currentLevel = LogLevels.ERROR
    return this
  }

  success () {
    this.currentLevel = LogLevels.SUCCESS
    return this
  }

  common () {
    this.currentLevel = LogLevels.COMMON
    return this
  }

  title (text: string) {
    this.logger.info(chalk.bold(this.resolveLevel(`## ${text.toUpperCase()} ##`)))
    return this
  }

  subText (text: any) {
    if (typeof text === 'object') text = JSON.stringify(text, null, this.indent())
    this.logger.info(this.resolveLevel(text))
    return this
  }

  listItem (text: string) {
    this.logger.info(`${this.indent(3)}> ${this.resolveLevel(text)}`)
    return this
  }
}
