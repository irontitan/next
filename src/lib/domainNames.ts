import { singular, plural } from 'pluralize'
import changeCase from 'change-case'

export interface ICaseDictionary {
  pascalCase: string
  kebabCase: string
  snakeCase: string
  sentenceCase: string
  camelCase: string
  singular: (word: string) => any
  plural: (word: string) => any
}

export interface ICaseDictionaryObject {
  [key: string]: {
    entityNames: ICaseDictionary
  }
}

export function getDictionary (domains: string[]): ICaseDictionaryObject {
  const returnObject = {}
  for (const domain of domains) {
    returnObject[changeCase.camelCase(domain)] = {
      entityNames: getEntityNames(domain)
    }
  }
  return returnObject
}

export function getEntityNames (entity: string): ICaseDictionary {
  return {
    pascalCase: changeCase.pascalCase(entity),
    kebabCase: changeCase.kebabCase(entity),
    snakeCase: changeCase.snakeCase(entity),
    sentenceCase: changeCase.sentenceCase(entity),
    camelCase: changeCase.camelCase(entity),
    singular,
    plural
  }
}
