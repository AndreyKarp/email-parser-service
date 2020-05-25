'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Logger = require('../../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _request = require('../../request/request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CCCService = function () {
  function CCCService() {
    _classCallCheck(this, CCCService);

    this.logger = new _Logger2.default();
  }

  _createClass(CCCService, [{
    key: 'sendMessage',
    value: function sendMessage(host, path, parameters) {
      this.logger.info(parameters);
      return new _request2.default(host).post(path, parameters).then(function (response) {
        return response;
      });
    }
  }]);

  return CCCService;
}();

exports.default = CCCService;