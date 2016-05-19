var express = require('express');
var cors = require('cors');
var _ = require('lodash');
var router = express.Router();
var distributionController = require('./controllers/distribution');
var quantileController = require('./controllers/quantile');
var medianController = require('./controllers/median');

router.get('/distribution', cors(), distributionController.process);

router.get('/quantiles', cors(), quantileController.process);

router.get('/median', cors(), medianController.process);

module.exports = router;
