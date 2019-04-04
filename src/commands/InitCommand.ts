import ejs from 'ejs'
import ora from 'ora'
import path from 'path'
import chalk from 'chalk'
import execa from 'execa'
import { sync as glob } from 'glob'
import { prompt as ask } from 'enquirer'
import { paths } from '../lib/directories'
import { rootFiles } from '../lib/rootFiles'
import { installers } from '../lib/installers'
import { Command } from '../structures/Command'
import { LogProvider } from '../lib/LogProvider'
import { ITemplateData } from '../structures/ITemplateData'
import { existsSync, writeFileSync, readdirSync } from 'fs'
import { getDictionary } from '../lib/domainNames'
import { gatherUserInfo } from '../lib/gatherUserInfo'
import { createDirectory } from '../lib/createDirectory'

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

  private async createFolders () {
    this.spinnerInstance.info('Creating project folders')

    // only executes on empty directories, if the directory does not exist then create
    if (existsSync(this.baseFolderPath) && readdirSync(this.baseFolderPath).length > 0) throw new Error(`Directory "${this.baseFolderPath}" already exists and it is not empty`)
    createDirectory(this.baseFolderPath)

    for (const directoryPath of paths) {
      const currentPath = path.join(this.baseFolderPath, directoryPath)
      createDirectory(currentPath)

      this.spinnerInstance.succeed(`Created folder ${directoryPath}`)
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
    this.templateData.entities = getDictionary(domains)

    this.templateData.domainInfo.routes = Object.keys(this.templateData.entities) // Generate route names array
    const domainTemplates = glob(path.join(this.templatesFolder, 'src', '**', '*.ejs')) // Get all templates from src directory
      .filter((domainTemplatePath) => domainTemplatePath.indexOf('index.ejs') < 0) // Filter those without an index (these should only be domains)

    for (const domain of Object.keys(this.templateData.entities)) {
      this.spinnerInstance.start(`Creating domain "${domain}"...`)

      const { entityNames } = this.templateData.entities[domain] // Extract all entity names
      createDirectory(path.join(this.baseFolderPath, 'src', 'presentation', 'routes', entityNames.kebabCase)) // create directories under /src/presentation/routes
      createDirectory(path.join(this.baseFolderPath, 'src', 'domain', entityNames.kebabCase, 'events')) // create directories under /src/domain/entity-name/

      // Compile all templates and generate all destination paths
      await Promise.all(domainTemplates.map(async (domainTemplatePath) => { // Loop through all domain files (generics)
        const destinationPath = domainTemplatePath // Create final path replacing entity names and file extensions
          .replace(/.*\/templates\/src/, `${this.baseFolderPath}/src`)
          .replace('.ejs', '.ts')
          .replace(/EntityName/, entityNames.pascalCase)
          .replace(/entity-name/, entityNames.kebabCase)

        const compiledTemplate = await ejs.renderFile(domainTemplatePath, this.templateData.entities[domain], { async: true })
        const destinationDir = path.dirname(destinationPath)

        createDirectory(destinationDir)
        writeFileSync(destinationPath, compiledTemplate)
      }))

      this.spinnerInstance.succeed(`Created domain "${domain}"`)
    }

    await this.createDomainIndexFile()
  }

  async createDomainIndexFile () {
    this.spinnerInstance.start('Creating domain index...')
    const templateFile = path.join(this.templatesFolder, 'src', 'domain', 'index.ejs')
    const compiledTemplate = await ejs.renderFile(templateFile, this.templateData, { async: true })
    writeFileSync(path.join(this.baseFolderPath, 'src', 'domain', 'index.ts'), compiledTemplate)
    this.spinnerInstance.succeed('Domain index created')
  }

  private async gatherProjectData (args: any, options: any) {
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
  }

  async gatherUserInfo () {
    this.spinnerInstance.info('Gathering user info...')
    const userInfo = await gatherUserInfo()
    this.templateData.project.author.name = userInfo.userName
    this.templateData.project.author.email = userInfo.userEmail
  }

  private async beginPipeline (_args: any, options: any) {
    await this.gatherUserInfo()
    await this.createFolders()
    await this.moveRootFiles()
    if (options.domains) await this.createDomains(options.domains)
    await this.moveBaseFiles() // this has to come last otherwise routes will not be read
  }

  private async installPackages () {
    const { installer } = await ask({
      type: 'select',
      name: 'installer',
      message: 'What command would you like to use?',
      choices: installers
    })

    this.spinnerInstance.info(`Beginning package installation using "${installer} install"...`)

    const installProcess = execa(installer, ['install'], { cwd: this.baseFolderPath, stdout: 'pipe' })
    installProcess.stdout.pipe(process.stdout)
    installProcess.stderr.pipe(process.stderr)
  }

  async execute (args: any, options: any) {
    try {
      this.spinnerInstance = ora('Initializing...')
      await this.gatherProjectData(args, options)

      this.spinnerInstance.start()
      await this.beginPipeline(args, options)

      const { shouldInstall } = await ask({
        type: 'confirm',
        name: 'shouldInstall',
        message: 'Do you want me to run the install command?'
      })

      if (shouldInstall) return this.installPackages().then(() => this.spinnerInstance.succeed('Process ended. Project creation complete'))

      return this.spinnerInstance.succeed('Process ended. Project creation complete').warn('run `npm install` to install all packages on your newly created project.')
    } catch (err) {
      if (err && err.message) return this.spinnerInstance.fail(err.message)
      return this.spinnerInstance.fail('Process ended: unknown error')
    }
  }
}
