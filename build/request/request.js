'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Axios = function () {
  function Axios(baseURL) {
    _classCallCheck(this, Axios);

    this.service = _axios2.default.create({
      baseURL: baseURL,
      responseType: 'json'
    });
  }

  _createClass(Axios, [{
    key: '_makeRequest',
    value: function _makeRequest(method, url) {
      var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var body = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      var request = void 0;
      switch (method) {
        case 'GET':
          request = this.service.get(url, queryParams);
          break;
        case 'POST':
          request = this.service.post(url, body, queryParams);
          break;
        case 'PUT':
          request = this.service.put(url, body, queryParams);
          break;
        case 'PATCH':
          request = this.service.patch(url, body, queryParams);
          break;
        case 'DELETE':
          request = this.service.delete(url, queryParams);
          break;
        default:
          throw new Error('Method not supported');
      }

      return new Promise(function (resolve, reject) {
        request.then(function (response) {
          if (response.data['status'] in response.data) {
            if (response.data['status'] === 'error') {
              console.error(new Error(response.data['error'], response.data['message']));
            } else {
              resolve(response.data);
            }
          } else {
            resolve(response.data);
          }
        }).catch(function (err) {
          if (err.response) {
            if (err.response.data) {
              if (err.response.status) {
                reject(err.response.data);
              } else {
                reject(err);
              }
            } else {
              reject(err);
            }
          } else {
            reject(err);
          }
        });
      });
    }
  }, {
    key: 'get',
    value: function get(url) {
      var queryParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      return this._makeRequest('GET', url, { params: queryParams }, null);
    }
  }, {
    key: 'post',
    value: function post(url, body) {
      var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return this._makeRequest('POST', url, { params: queryParams }, body);
    }
  }, {
    key: 'put',
    value: function put(url, body) {
      var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return this._makeRequest('PUT', url, { params: queryParams }, body);
    }
  }, {
    key: 'patch',
    value: function patch(url, body) {
      var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return this._makeRequest('PATCH', url, { params: queryParams }, body);
    }
  }, {
    key: 'delete',
    value: function _delete(url) {
      var queryParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      return this._makeRequest('DELETE', url, queryParams, null);
    }
  }]);

  return Axios;
}();

exports.default = Axios;