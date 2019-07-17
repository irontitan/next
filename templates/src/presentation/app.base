import 'reflect-metadata'
import routes from './routes'
import { Express } from 'express'
import expresso from '@expresso/app'
import { container } from 'tsyringe'
import { Services } from '../services'
import { IAppConfig } from '../app-config'
import { IExpressoAppFactory } from '@expresso/server'
import { createConnection } from '@nindoo/mongodb-data-layer'

export const app: IExpressoAppFactory<IAppConfig> = expresso(async (app: Express, config: IAppConfig, environment: string) => {
  // Database connection already initiated
  // Your services will be automatically injected
  const mongodbConnection = await createConnection(config.database.mongodb)

  // Register connection to dependency injection container as it is not a class
  container.register('MongodbConnection', { useValue: mongodbConnection })
  // Resolve services with container
  const services = container.resolve(Services)

  // Put your routes below
  // Example: app.get('/users', routes.user.get.factory(services.userService))
})
