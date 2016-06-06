var _       = require("lodash");
var pg      = require("pg");
var utils   = require('../utils');
var conn_options = require("../../scripts/redshift-config.json");

var quantileController = {
  process: function(req, res, next){
    var queryParams = _.pick(req.query, ["state", "race", "sex", "agegroup", "quantile", "compare", "year"]);
    utils.validateQueryParams(queryParams, function(err, validateCallback) {
      if(err) { return next(err); }

      var sql = utils.buildQuantileSQL(queryParams);
      if(compare && compare !== "") {
        quantileController.getCompareIncomeQuantiles(sql, res, next);
      } else {
        quantileController.getIncomeQuantiles(sql, res, next);
      }
    });

  },

  getCompareIncomeQuantiles: function(sql, res, next) {
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
        });

        var resultsObjSorted = {};
        Object.keys(resultsObj).sort().forEach(function(key) {
          resultsObjSorted[key] = resultsObj[key];
        });

        res.json(resultsObjSorted);
      });
    });
  },

  getIncomeQuantiles: function(sql, res, next){
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
      });
    });
  }
};

module.exports = quantileController;
