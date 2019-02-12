export interface ITemplateData {
  project: {
    name: string
    description?: string
    author: {
      name?: string
      email?: string
    }
    repository: {
      type?: string
      url?: string
    }
  }
  entities: {
    [key: string]: {
      entityNames: {
        pascalCase: string
        kebabCase: string
        snakeCase: string
        sentenceCase: string
        camelCase: string
      }
    },
  },
  domainInfo: {
    routes: string[]
  }
}
