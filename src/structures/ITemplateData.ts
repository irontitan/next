import { ICaseDictionaryObject } from '../lib/domainNames'

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
  entities: ICaseDictionaryObject,
  domainInfo: {
    routes: string[]
  }
}
