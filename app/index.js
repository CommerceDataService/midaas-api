var express = require('express');
var pg = require('pg');
var router = require('./routes');

var app = express();

app.listen(4000, function(){
  console.log("app listening on port 4000");
});

app.use('/income', router);
