'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _imap = require('imap');

var _imap2 = _interopRequireDefault(_imap);

var _mailparser = require('mailparser');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _CCCService = require('../CCC/CCCService');

var _CCCService2 = _interopRequireDefault(_CCCService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_bluebird2.default.longStackTraces();

var EmailParcesService = function () {
  function EmailParcesService(emailsConfig, config, logger) {
    _classCallCheck(this, EmailParcesService);

    this.emailsConfig = emailsConfig;
    this.config = config;
    this.imap = _bluebird2.default.promisifyAll(new _imap2.default(this.emailsConfig));
    this.http = new _CCCService2.default();
    this.logger = logger;
  }

  /**
   * main event
   */


  _createClass(EmailParcesService, [{
    key: 'handle',
    value: function handle() {
      var _this = this;

      this.imap.once('ready', function () {
        return _this.execute();
      });
      this.imap.once('error', function (err) {
        return _this.logger.info('Connection error: ' + err.stack);
      });
      this.imap.connect();
    }

    /**
     * search unseen mail a
     */

  }, {
    key: 'execute',
    value: function execute() {
      var _this2 = this;

      this.imap.openBox('INBOX', false, function (err, mailBox) {
        if (err) {
          _this2.logger.info(err);
          return;
        }
        _this2.imap.search(['UNSEEN'], function (err, results) {
          if (!results || !results.length) {
            _this2.logger.info('No unread mails');
            _this2.imap.end();
            return;
          }
          // mark as seen
          _this2.imap.setFlags(results, ['\\Seen'], function (err) {
            if (!err) {
              _this2.logger.info('marked as read');
            } else {
              _this2.logger.info(JSON.stringify(err, null, 2));
            }
          });

          var f = _this2.imap.fetch(results, { bodies: '' });
          f.on('message', function (msg, seqno) {
            _this2.logger.info('Message #%d' + seqno);
            var prefix = '(#' + seqno + ') ';
            msg.on('body', function (stream, info) {
              return _this2.processMessage(stream, info);
            });
            msg.once('end', function () {
              _this2.logger.info(prefix + 'Finished');
            });
          });
          f.once('error', function (err) {
            return _this2.logger.info('Fetch error: ' + err);
          });
          f.once('end', function () {
            _this2.logger.info('Done fetching all messages!');
            _this2.imap.end();
          });
        });
      });
    }

    /**
     * parse messages body and attachment
     * @param msg
     * @param seqno
     */

  }, {
    key: 'processMessage',
    value: function processMessage(stream, info) {
      var _this3 = this;

      var container = {};
      container.attachment = [];
      (0, _mailparser.simpleParser)(stream).then(function (mail) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = mail.to.value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            container.to = key.address || null;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = mail.from.value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _key = _step2.value;

            container.from = _key.address || null;
            container.chatId = _key.address || null;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        container.body = mail.text;
        mail.attachments.map(function (att) {
          var filename = _this3.getRandomNumber() + '_' + _this3.getReplaceFileName(att.filename);
          var uploadsPath = _path2.default.join('/tmp', filename);
          _fs2.default.writeFile(uploadsPath, att.content, function (err) {
            return console.error(err);
          });
          container.attachment.push(uploadsPath);
        });
        _this3.logger.info(container);
        _this3.http.sendMessage(_this3.config.ccc.host, _this3.config.ccc.path.email + '/' + _this3.config.ccc.token, container).then(function (res) {
          return _this3.logger.info(res);
        }).catch(function (err) {
          return _this3.logger.info(err);
        });
      });
    }
  }, {
    key: 'getRandomNumber',
    value: function getRandomNumber() {
      return parseInt(Math.random() * 100);
    }
  }, {
    key: 'getReplaceFileName',
    value: function getReplaceFileName(filename) {
      return filename.replace(EmailParcesService.REGEXP, '-');
    }
  }]);

  return EmailParcesService;
}();

EmailParcesService.REGEXP = /[^а-яА-Яa-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸЇїіІçÇßØøÅåÆæœ0-9\.]+/g;
exports.default = EmailParcesService;