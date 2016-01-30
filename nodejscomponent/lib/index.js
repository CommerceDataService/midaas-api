/**
 * Lib
 */

 var _       = require("lodash");
 var mysql   = require("mysql");
 var numeral = require("numeraljs");

 var conn_options = {};
 var connection = mysql.createConnection(conn_options);

module.exports.getIncomeMean = function(event, callback) {

  var sql = "SELECT AVG(WAGP)*ADJINC/1000000 AS MEAN_INCOME FROM PUMS_2014_Persons";

  validQueries = _.pick(event, ["PUMA", "SEX", "RAC1P"]);
  // console.log(validQueries);
  if(!_.isEmpty(validQueries)) {
    sql += " WHERE ";
    sqlWhere = [];
    _.forOwn(validQueries, function(value, key) {
      sqlWhere.push(key + "=" + value);
    });
    sql += sqlWhere.join(" && ");
  }
  sql += ";";
  // console.log(sql);

  connection.query(sql, function(err, results, fields){
    var mean = results[0]["MEAN_INCOME"];
    var formattedMean = numeral(mean).format("($0.00a)");
    return callback(err, {"mean": formattedMean});
	});

}
