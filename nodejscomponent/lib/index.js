/**
 * Lib
 */

var _       = require("lodash");
var pg      = require("pg");
var numeral = require("numeraljs");

var utils   = require("./utils.js");

var conn_options = require("./redshift-config.json");

module.exports.getIncomeQuantiles = function(event, callback) {

  var queryParams = _.pick(event, ["state", "race", "sex", "agegroup"]);

  utils.validateQueryParams(queryParams, function(err, validateCallback) {
    if(err) { return callback(err); }

    var sql = "SELECT QUANTILE, INCOME FROM PUMS_2014_Quantiles";
    sql = utils.appendWhereClause(sql, queryParams) + ";";
    // return callback(null, sql);

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return callback(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return callback(err); }

        var results = response.rows;
        resultsObj = {};
        _.forEach(results, function(result) {
          resultsObj[result["quantile"]] = result["income"];
        })

        return callback(err, resultsObj);
      });
    });
  });

}

module.exports.getIncomeDistribution = function(event, callback) {

  var queryParams = _.pick(event, ["state", "race", "sex", "agegroup"]);

  utils.validateQueryParams(queryParams, function(err, validateCallback) {
    if(err) { return callback(err); }

    var sql =
      "SELECT FLOOR((PERNP*ADJINC/1000000)/10000)*10000 AS BUCKET," +
      " COUNT(*) AS COUNT" +
      " FROM PUMS_2014_Persons";

    sql = utils.appendTranslatedWhereClause(sql, queryParams);
    sql += " GROUP BY BUCKET;";
    // return callback(null, sql);

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return callback(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return callback(err); }

        var results = response.rows;
        resultsObj = {};
        total = _.sumBy(results, (function(result) {
          return result["count"];
        }));
        _.forEach(results, function(result, i) {
          start = utils.formatIncome(results[i]["bucket"]);
          end = utils.formatIncome(results[i]["bucket"] + 10000);
          key = "" + start + "-" + end;
          // key = result["bucket"];
          resultsObj[key] = result["count"]/total;
        })

        return callback(err, resultsObj);
      });
    });
  });

}
