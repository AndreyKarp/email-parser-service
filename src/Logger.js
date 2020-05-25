const fs = require('fs')
const eol = require('os').EOL
const path = require('path')
const dir = path.join(__dirname, `logs${ path.sep }`)

module.exports = class Logger {

  Zero (val, length = 2) {
    val = val.toString()
    val = ('0' + val).substr(-length)
    return val
  }

  Write (message) {
    const filename = new Error().stack.split('\n')[3].split('/').pop().split(':')[0]

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    let date = new Date()
    let time = `${ this.Zero(date.getHours()) }:${ this.Zero(date.getMinutes()) }:${ this.Zero(date.getSeconds()) }`
    let result = `[${ time }][${ filename }] ${ JSON.stringify(message) }`
    console.log(result)
    fs.appendFile(`${ dir }${ date.getFullYear() }-${ this.Zero(date.getMonth() + 1) }-${ this.Zero(date.getDate()) }.log`, result + eol, () => {
    })

  }

  info (message) {
    let func = 'unknown'
    // if (arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.name) {
    //   func = arguments.callee.caller.name
    // }

    this.Write(message)
  }

  reportError (error) {
    if (error && error.name && error.message && error.stack) {
      this.info({ error: { name: error.name, message: error.message, stack: error.stack } })
    } else {
      this.info(error)
    }
  }
}
const glob = {}

Object.defineProperty(glob, '__stack', {
  get: function () {
    let orig = Error.prepareStackTrace
    Error.prepareStackTrace = function (_, stack) {
      return stack
    }
    let err = new Error
    Error.captureStackTrace(err, arguments.callee)
    let stack = err.stack
    Error.prepareStackTrace = orig
    return stack
  }
})

Object.defineProperty(glob, '__line', {
  get: function () {
    return glob.__stack[3].getLineNumber()
  }
})
