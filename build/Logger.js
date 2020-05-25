'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var eol = require('os').EOL;
var path = require('path');
var dir = path.join(__dirname, 'logs' + path.sep);

module.exports = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, [{
    key: 'Zero',
    value: function Zero(val) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

      val = val.toString();
      val = ('0' + val).substr(-length);
      return val;
    }
  }, {
    key: 'Write',
    value: function Write(message) {
      var filename = new Error().stack.split('\n')[3].split('/').pop().split(':')[0];

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      var date = new Date();
      var time = this.Zero(date.getHours()) + ':' + this.Zero(date.getMinutes()) + ':' + this.Zero(date.getSeconds());
      var result = '[' + time + '][' + filename + '] ' + JSON.stringify(message);
      console.log(result);
      fs.appendFile('' + dir + date.getFullYear() + '-' + this.Zero(date.getMonth() + 1) + '-' + this.Zero(date.getDate()) + '.log', result + eol, function () {});
    }
  }, {
    key: 'info',
    value: function info(message) {
      var func = 'unknown';
      // if (arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.name) {
      //   func = arguments.callee.caller.name
      // }

      this.Write(message);
    }
  }, {
    key: 'reportError',
    value: function reportError(error) {
      if (error && error.name && error.message && error.stack) {
        this.info({ error: { name: error.name, message: error.message, stack: error.stack } });
      } else {
        this.info(error);
      }
    }
  }]);

  return Logger;
}();
var glob = {};

Object.defineProperty(glob, '__stack', {
  get: function get() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(glob, '__line', {
  get: function get() {
    return glob.__stack[3].getLineNumber();
  }
});