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
        var sql = quantileController.buildSQL(queryParams);
        quantileController.getCompareIncomeQuantiles(sql, res, next);
      } else {
        var sql = quantileController.buildSQL(queryParams);
        quantileController.getIncomeQuantiles(sql, res, next);
      }
    });

  },
  buildSQL: function(queryParams){
    var compare = queryParams.compare;
    if(compare && compare !== "") {
      delete queryParams[compare];
      delete queryParams["compare"];
      var sql = "SELECT QUANTILE, INCOME, " + compare + " FROM PUMS_2014_Quantiles";
      sql = utils.appendWhereClause(sql, queryParams, compare) + " ORDER BY QUANTILE::INT ASC;";
      return sql;
    } else {
      delete queryParams["compare"];
      var sql = "SELECT QUANTILE, INCOME FROM PUMS_2014_Quantiles";
      sql = utils.appendWhereClause(sql, queryParams) + " ORDER BY QUANTILE::INT ASC;";
      return sql;
        }
  },

  getCompareIncomeQuantiles: function(sql, res, next) {
    // var compare = queryParams.compare;
    // if(compare && compare !== "") {
    //   delete queryParams[compare];
    // }
    // delete queryParams["compare"];
    //
    // var sql = "SELECT QUANTILE, INCOME, " + compare + " FROM PUMS_2014_Quantiles";
    // sql = utils.appendWhereClause(sql, queryParams, compare) + " ORDER BY QUANTILE::INT ASC;";
    pg.connect(conn_options, function(err, client, next) {
      if(err) { return next(err); }

      client.query(sql, function(err, response) {
        next();
        if(err) { return next(err); }

        var results = response.rows;
        resultsObj = {};
        _.forEach(results, function(result) {
          if(result[compare] != "") {
            var path = "['" + result[compare] + "']" + "['" + result["quantile"] + "%']";
            _.set(resultsObj, path, result["income"]);
          }
        })

        var resultsObjSorted = {};
        Object.keys(resultsObj).sort().forEach(function(key) {
          resultsObjSorted[key] = resultsObj[key];
        });

        res.json(resultsObjSorted);
      });
    });
  },

  getIncomeQuantiles: function(sql, res, next){
    // var sql = "SELECT QUANTILE, INCOME FROM PUMS_2014_Quantiles";
    // sql = utils.appendWhereClause(sql, queryParams) + " ORDER BY QUANTILE::INT ASC;";
    // return sql;
    pg.connect(conn_options, function(err, client, next) {
      if(err) { return next(err); }

      client.query(sql, function(err, response) {
        next();
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

};

module.exports = quantileController;
