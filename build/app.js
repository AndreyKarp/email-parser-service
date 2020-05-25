'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeCron = require('node-cron');

var _nodeCron2 = _interopRequireDefault(_nodeCron);

var _emailsConfig = require('./config/emailsConfig');

var _emailsConfig2 = _interopRequireDefault(_emailsConfig);

var _config = require('./config/config');

var _config2 = _interopRequireDefault(_config);

var _EmailParcesService = require('./services/EmailParser/EmailParcesService');

var _EmailParcesService2 = _interopRequireDefault(_EmailParcesService);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var logger = new _Logger2.default();

app.use(_express2.default.json());

_nodeCron2.default.schedule('* * * * *', function () {
  logger.info('running a task every minute');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _emailsConfig2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      new _EmailParcesService2.default(item, _config2.default, logger).handle();
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
});
app.listen(_config2.default.port);
logger.info('app running on port');