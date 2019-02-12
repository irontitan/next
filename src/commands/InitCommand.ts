import ejs from 'ejs'
import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import execa from 'execa'
import { sync as glob } from 'glob'
import changeCase from 'change-case'
import { prompt as ask } from 'enquirer'
import { paths } from '../lib/directories'
import { rootFiles } from '../lib/rootFiles'
import { Command } from '../structures/Command'
import { LogProvider } from '../lib/LogProvider'
import { ITemplateData } from '../structures/ITemplateData'
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs'

export class InitCommand extends Command {
  private baseFolderPath: string = process.cwd()
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
    entities: {},
    domainInfo: {
      routes: []
    }
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
    if (existsSync(this.baseFolderPath) && readdirSync(this.baseFolderPath).length > 0) throw new Error(`Directory "${this.baseFolderPath}" already exists and it is not empty`)
    if (!existsSync(this.baseFolderPath)) mkdirSync(this.baseFolderPath)

    for (const directoryPath of paths) {
      const currentPath = path.join(this.baseFolderPath, directoryPath)
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
      writeFileSync(path.join(this.baseFolderPath, `${rootFile.name}${rootFile.finalExtension}`), compiledTemplate)
    }

    this.spinnerInstance.succeed('Root files placed')
  }

  private async moveBaseFiles () {
    this.spinnerInstance.start('Moving base files...')

    const originGlob = path.join(this.templatesFolder, 'src', '**', '*.base')
    const templateFiles = glob(originGlob)

    for (const template of templateFiles) {
      const compiledTemplate = await ejs.renderFile(template, this.templateData, { async: true })
      const destinationPath = template.replace(/.*\/templates\/src/, `${this.baseFolderPath}/src`).replace('.base', '.ts')
      writeFileSync(destinationPath, compiledTemplate)
    }
    this.spinnerInstance.succeed('Moved base files')
  }

  private async createDomains (domains: string[]) {
    this.spinnerInstance.info('Creating domains...')
    this.setDomainNames(domains)

    this.templateData.domainInfo.routes = Object.keys(this.templateData.entities)
    const domainTemplates = glob(path.join(this.templatesFolder, 'src', '**', '*.ejs')).filter((domainTemplatePath) => domainTemplatePath.indexOf('index.ejs') < 0)

    for (const domain of Object.keys(this.templateData.entities)) {
      this.spinnerInstance.start(`Creating domain "${domain}"...`)

      const namesDictionary = this.templateData.entities[domain].entityNames
      const domainDirectoryPath = path.join(this.baseFolderPath, 'src', 'domain', namesDictionary.kebabCase)
      if (!existsSync(domainDirectoryPath)) mkdirSync(domainDirectoryPath, { recursive: true })

      // Compile all templates and generate all destination paths
      await Promise.all(domainTemplates.map(async (domainTemplatePath) => {
        const destinationPath = domainTemplatePath.replace(/.*\/templates\/src/, `${this.baseFolderPath}/src`).replace('.ejs', '.ts').replace(/EntityName/, namesDictionary.pascalCase).replace(/entity-name/, namesDictionary.kebabCase)
        const compiledTemplate = await ejs.renderFile(domainTemplatePath, this.templateData.entities[domain], { async: true })
        const destinationDir = path.dirname(destinationPath)

        if (!existsSync(destinationDir)) mkdirSync(destinationDir, { recursive: true })
        writeFileSync(destinationPath, compiledTemplate)
      }))

      this.spinnerInstance.info(`Created domain "${domain}"`)
    }

    await this.createDomainIndexFile()
  }

  async createDomainIndexFile () {
    this.spinnerInstance.start('Creating domain index...')
    const templateFile = path.join(this.templatesFolder, 'src', 'domain', 'index.ejs')

  }

  async execute (args: any, options: any) {
    try {
      this.spinnerInstance = ora('Initializing...')
      this.templateData.project.name = args.projectName

      const { description } = await ask({
        type: 'input',
        name: 'description',
        message: 'Give me a short description of your project (optional)'
      })
      this.templateData.project.description = description

      this.baseFolderPath = path.join(path.resolve(options.folder || this.baseFolderPath), this.templateData.project.name)
      this.logger
        .info()
        .title(`Starting creation of project "${args.projectName}"`)
        .warn()
        .subText(chalk.italic(`Files will be created at "${this.baseFolderPath}`))

      this.spinnerInstance.start()
      await this.gatherUserInfo()
      await this.createFolders()
      await this.moveRootFiles()
      if (options.domains) await this.createDomains(options.domains)
      await this.moveBaseFiles() // this has to come last otherwise routes will not be read

      this.spinnerInstance.succeed('Process ended. Project creation complete')
    } catch (err) {
      if (err && err.message) return this.spinnerInstance.fail(err.message)
      return this.spinnerInstance.fail('Process ended: unknown error')
    }
  }

}
