var _       = require("lodash");
var pg      = require("pg");
var utils = require('../utils');
var conn_options = require("../../scripts/redshift-config.json");

var quantileController = {
  process: function(req, res, next){
    var queryParams = _.pick(req.query, ["state", "race", "sex", "agegroup", "quantile", "compare"]);

    utils.validateQueryParams(queryParams, function(err, validateCallback) {
      if(err) { return next(err); }

      if(compare && compare !== "") {
        quantileController.getCompareIncomeQuantiles(queryParams, res, next);
      } else {
        delete queryParams["compare"];
        quantileController.getIncomeQuantiles(queryParams, res, next);
      }
    });

  },

  getIncomeQuantiles: function(queryParams, res, next){
    var sql = "SELECT QUANTILE, INCOME FROM PUMS_2014_Quantiles";
    sql = utils.appendWhereClause(sql, queryParams) + " ORDER BY QUANTILE::INT ASC;";

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return next(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return next(err); }

        var results = response.rows;
        resultsObj = {};
        _.forEach(results, function(result) {
          resultsObj[result["quantile"] + "%"] = result["income"];
        });
        res.json({"overall": resultsObj});
        // return next(err, {"overall": resultsObj});
      });
    });
  },

  getCompareIncomeMedian: function(queryParams, res, next){
    var compare = queryParams.compare;
    if(compare && compare !== "") {
      delete queryParams[compare];
    }
    delete queryParams["compare"];

    var sql = "SELECT QUANTILE, INCOME, " + compare + " FROM PUMS_2014_Quantiles";
    sql = utils.appendWhereClause(sql, queryParams) + " ORDER BY QUANTILE::INT ASC;";

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return next(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return next(err); }

        var results = response.rows;
        resultsObj = {};
        _.forEach(results, function(result) {
          if(result[compare] !== "") {
            var path = "['" + result[compare] + "']" + "['" + result["quantile"] + "%']";
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
};

module.exports = quantileController;
