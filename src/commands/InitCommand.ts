import ejs from 'ejs'
import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import execa from 'execa'
import changeCase from 'change-case'
import { prompt as ask } from 'enquirer'
import { rootFiles } from '../lib/rootFiles'
import { Command } from '../structures/Command'
import { LogProvider } from '../lib/LogProvider'
import { paths } from '../../dist/lib/directories'
import { ITemplateData } from '../structures/ITemplateData'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, readFileSync } from 'fs'

export class InitCommand extends Command {
  private baseFolder = process.cwd()
  private spinnerInstance
  private templateData: ITemplateData = {
    project: {
      author: {},
      description: '',
      name: '',
      repository: {
        type: 'git',
        url: ''
      }
    },
    entities: {}
  }

  constructor (logger: LogProvider) {
    super(logger)
  }

  private async gatherUserInfo () {
    this.spinnerInstance.info('Gathering user info...')
    let userName: string
    let userEmail: string

    try {
      const { stdout: name } = await execa('git', ['config', '--get', 'user.name'], { stderr: 'ignore' })
      const { stdout: email } = await execa('git', ['config', '--get', 'user.email'], { stderr: 'ignore' })

      userName = name
      userEmail = email
    } catch (err) {
      this.spinnerInstance.fail('I could not find your info :(')

      const { name, email } = await ask([{
        type: 'input',
        name: 'name',
        message: 'What is your name?'
      }, {
        type: 'input',
        name: 'email',
        message: 'What is your email?'
      }])

      userName = name
      userEmail = email
    }

    this.templateData.project.author.name = userName
    this.templateData.project.author.email = userEmail
    if (userName && userEmail) this.spinnerInstance.succeed(`Gathered user information (you're "${userName}" and your email is "${userEmail}" ;D)`)
  }

  private setDomainNames (domains: string[]) {
    for (const domain of domains) {
      this.templateData.entities[changeCase.camelCase(domain)] = {
        entityNames: {
          pascalCase: changeCase.pascalCase(domain),
          kebabCase: changeCase.kebabCase(domain),
          snakeCase: changeCase.snakeCase(domain),
          sentenceCase: changeCase.sentenceCase(domain),
          camelCase: changeCase.camelCase(domain)
        }
      }
    }
  }

  private async createFolders () {
    this.spinnerInstance.info('Creating project folders')

    // only executes on empty directories, if the directory does not exist then create
    if (existsSync(this.baseFolder) && readdirSync(this.baseFolder).length > 0) throw new Error(`Directory "${this.baseFolder}" already exists and it is not empty`)
    if (!existsSync(this.baseFolder)) mkdirSync(this.baseFolder)

    for (const directoryPath of paths) {
      const currentPath = path.join(this.baseFolder, directoryPath)
      if (!existsSync(currentPath)) mkdirSync(currentPath)

      this.spinnerInstance.succeed(`Created folder ${directoryPath}`)
      if (directoryPath !== 'src') writeFileSync(path.join(currentPath, '.gitkeep'), null)
    }

    this.spinnerInstance.succeed('Directories were created')
  }

  private async moveRootFiles () {
    this.spinnerInstance.start('Moving root files...')

    for (const rootFile of rootFiles) {
      const compiledTemplate = await ejs.renderFile(path.join(this.templatesFolder, 'root', `${rootFile.name}.ejs`), this.templateData, { async: true })
      writeFileSync(path.join(this.baseFolder, `${rootFile.name}${rootFile.finalExtension}`), compiledTemplate)
    }

    this.spinnerInstance.succeed('Root files placed')
  }

  private async moveBaseFiles () {

  }

  private async createDomains () {

  }

  async execute (args: any, options: any) {
    try {
      this.templateData.project.name = args.projectName
      const { description } = await ask({
        type: 'input',
        name: 'description',
        message: 'Give me a short description of your project (optional)'
      })
      this.templateData.project.description = description

      this.baseFolder = path.join(path.resolve(options.folder || this.baseFolder), this.templateData.project.name)
      if (options.domains) this.setDomainNames(options.domains)

      this.logger
        .info()
        .title(`Starting creation of project "${args.projectName}"`)
        .warn()
        .subText(chalk.italic(`Files will be created at "${this.baseFolder}`))

      this.spinnerInstance = ora('Initializing...').start()
      await this.gatherUserInfo()
      await this.createFolders()
      await this.moveRootFiles()
      await this.moveBaseFiles()
      await this.createDomains()

      this.spinnerInstance.succeed('Process ended. Project creation complete')
    } catch (err) {
      this.spinnerInstance.fail(err.message)
    }
  }

}
