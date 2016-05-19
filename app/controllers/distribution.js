var _       = require("lodash");
var pg      = require("pg");
var utils = require('../utils');
var conn_options = require("../../scripts/redshift-config.json");


var distributionController = {
  process: function(req, res, next){
    var queryParams = _.pick(req.query, ["state", "race", "sex", "agegroup"]);

    utils.validateQueryParams(queryParams, function(err, validateCallback) {
      if(err) { return next(err); }
      distributionController.getIncomeDistribution(queryParams, res, next);
    });
  },

  getIncomeDistribution: function(queryParams, res, next){
    var sql =
      "SELECT FLOOR(PERNP/10000)*10000 AS BUCKET," +
      " SUM(PWGTP) AS COUNT" +
      " FROM PUMS_2014_Persons";

    sql = utils.appendTranslatedWhereClause(sql, queryParams);
    sql += " GROUP BY BUCKET;";
    // return callback(null, sql);

    pg.connect(conn_options, function(err, client, done) {
      if(err) { return next(err); }

      client.query(sql, function(err, response) {
        done();
        if(err) { return next(err); }

        var results = response.rows;
        resultsObj = {};
        total = _.sumBy(results, (function(result) {
          return parseInt(result["count"]);
        }));
        _.forEach(results, function(result, i) {
          var bucket = parseInt(results[i]["bucket"]);
          var start = utils.formatIncome(bucket);
          var end = utils.formatIncome(bucket + 10000);
          var key = "" + start + "-" + end;
          // key = result["bucket"];
          resultsObj[key] = parseInt(result["count"])/total;
        });
        res.json(resultsObj);
        // return next(err, resultsObj);
      });
    });
  }
};

module.exports = distributionController;
