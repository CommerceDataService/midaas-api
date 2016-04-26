var _       = require("lodash");
var pg      = require("pg");
var utils = require('../utils');
// var conn_options = require("./redshift-config.json");

var medianController = {
  process: function(req, res, next){
    var queryParams = _.pick(req.params, ["state", "race", "sex", "agegroup", "compare"]);

    utils.validateQueryParams(queryParams, function(err, validateCallback) {
      if(err) { return next(err); }

      if(compare && compare !== "") {
        medianController.getCompareIncomeMedian(queryParams, res, next);
      } else {
        delete queryParams["compare"];
        medianController.getIncomeMedian(queryParams, res, next);
      }
    });

  },

  getIncomeMedian: function(queryParams, res, next){
    var sql = "SELECT INCOME FROM PUMS_2014_Quantiles";
    sql = utils.appendWhereClause(sql, queryParams) + " AND QUANTILE='50';";

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return callback(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return callback(err); }

        var results = response.rows;
        resultsObj = {};
        _.forEach(results, function(result) {
          resultsObj = result["income"];
        })

        return next(err, {"overall": resultsObj});
      });
    });
  },

  getCompareIncomeMedian: function(queryParams, res, next){
    var compare = queryParams.compare;
    if(compare && compare !== "") {
      delete queryParams[compare];
    }
    delete queryParams["compare"];

    var sql = "SELECT INCOME, " + compare + " FROM PUMS_2014_Quantiles";
    sql = utils.appendWhereClause(sql, queryParams) + " AND QUANTILE='50';";

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return next(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return next(err); }

        var results = response.rows;
        resultsObj = {};
        _.forEach(results, function(result) {
          if(result[compare] != "") {
            var path = "['" + result[compare] + "']";
            _.set(resultsObj, path, result["income"]);
          }
        });

        var resultsObjSorted = {};
        Object.keys(resultsObj).sort().forEach(function(key) {
          resultsObjSorted[key] = resultsObj[key];
        });

        return next(err, resultsObjSorted);
      });
    });
  }
}

module.exports = medianController
