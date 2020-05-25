import Imap from 'imap'
import { simpleParser } from 'mailparser'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import CCC from '../CCC/CCCService'
Promise.longStackTraces()

export default class EmailParcesService {

  static REGEXP = /[^а-яА-Яa-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸЇїіІçÇßØøÅåÆæœ0-9\.]+/g

  constructor (emailsConfig, config, logger) {
    this.emailsConfig = emailsConfig
    this.config = config
    this.imap = Promise.promisifyAll(new Imap(this.emailsConfig))
    this.http = new CCC()
    this.logger = logger

  }

  /**
   * main event
   */
  handle () {
    this.imap.once('ready', () => this.execute())
    this.imap.once('error',
      (err) => this.logger.info('Connection error: ' + err.stack))
    this.imap.connect()
  }

  /**
   * search unseen mail a
   */
  execute () {
    this.imap.openBox('INBOX', false, (err, mailBox) => {
      if (err) {
        this.logger.info(err)
        return
      }
      this.imap.search(['UNSEEN'], (err, results) => {
        if (!results || !results.length) {
          this.logger.info('No unread mails')
          this.imap.end()
          return
        }
        // mark as seen
        this.imap.setFlags(results, ['\\Seen'], (err) => {
          if (!err) {
            this.logger.info('marked as read')
          }
          else {
            this.logger.info(JSON.stringify(err, null, 2))
          }
        })

        const f = this.imap.fetch(results, { bodies: '' })
        f.on('message', (msg, seqno) => {
          this.logger.info('Message #%d' + seqno)
          const prefix = '(#' + seqno + ') '
          msg.on('body', (stream, info) => this.processMessage(stream, info))
          msg.once('end', () => {
            this.logger.info(prefix + 'Finished')
          })
        })
        f.once('error', (err) => this.logger.info('Fetch error: ' + err))
        f.once('end', () => {
          this.logger.info('Done fetching all messages!')
          this.imap.end()
        })
      })
    })
  }

  /**
   * parse messages body and attachment
   * @param msg
   * @param seqno
   */
  processMessage (stream, info) {
    const container = {}
    container.attachment = []
    simpleParser(stream).then(mail => {
      for (const key of mail.to.value) {
        container.to = key.address || null
      }
      for (const key of mail.from.value) {
        container.from = key.address || null
        container.chatId = key.address || null
      }
      container.body = mail.text
      mail.attachments.map(att => {
        const filename = `${this.getRandomNumber()}_${this.getReplaceFileName(
          att.filename)}`
        const uploadsPath = path.join('/tmp', filename)
        fs.writeFile(uploadsPath, att.content, (err) => console.error(err))
        container.attachment.push(uploadsPath)
      })
      this.logger.info(container)
      this.http.sendMessage(
        this.config.ccc.host,
        `${this.config.ccc.path.email}/${this.config.ccc.token}`,
        container,
      ).then(res => this.logger.info(res)).catch(err => this.logger.info(err))

    })
  }

  getRandomNumber () {
    return parseInt(Math.random() * 100)
  }

  getReplaceFileName (filename) {
    return filename.replace(
      EmailParcesService.REGEXP,
      '-')
  }
}
