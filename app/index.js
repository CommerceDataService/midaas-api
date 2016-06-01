var express = require('express');
var pg = require('pg');
var router = require('./routes');
var basic_auth = require('basic-auth');
var auth = require('./auth');
var process = require('process');
var helmet = require('helmet');
var path = require('path');

// load values from .env file and make them available at process.env
var env_path = path.join(__dirname, '.env');
require('dotenv').config({ path: env_path });

var app = express();
app.use(helmet());
app.use(auth);

app.use('/income', router);

module.exports = app;
