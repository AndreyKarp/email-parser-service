import express from 'express'
import cron from 'node-cron'
import emailsConfig from './config/emailsConfig'
import config from './config/config'
import EmailParcesService from './services/EmailParser/EmailParcesService'
import Logger from './Logger'

const app = express()
const logger = new Logger()

app.use(express.json())

cron.schedule('* * * * *', () => {
  logger.info('running a task every minute')
  for (let item of emailsConfig) {
    new EmailParcesService(item, config, logger).handle()
  }
})
app.listen(config.port)
logger.info('app running on port')
