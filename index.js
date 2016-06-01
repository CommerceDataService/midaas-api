var app = require('./app');


var port = process.env.MIDAAS_API_PORT || 8080;

app.listen(port, function(){
  console.log("app listening on port " + port);
});
