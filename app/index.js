var express = require('express');
var pg = require('pg');
var router = require('./routes');

var app = express();

app.listen(8080, function(){
  console.log("app listening on port 8080");
});

app.use('/income', router);
