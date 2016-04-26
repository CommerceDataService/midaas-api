var express = require('express');
var _ = require('lodash');
var router = express.Router();
var distributionController = require('./controllers/distribution');
var quantileController = require('./controllers/quantile');
var medianController = require('./controllers/median');

router.get('/distribution', distributionController.process);

router.get('/quantiles', quantilesController.process);

router.get('/median', medianController.process);

module.exports = router;
