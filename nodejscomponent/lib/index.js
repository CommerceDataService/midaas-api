/**
 * Lib
 */

var _       = require("lodash");
var mysql   = require("mysql");
var numeral = require("numeraljs");

var conn_options = require("./rds-config.json");
var connection = mysql.createConnection(conn_options);

var appendWhereClause = function(sql, validQueries) {
  // console.log(validQueries);
  if(!_.isEmpty(validQueries)) {
    sql += " WHERE ";
    sqlWhere = [];
    _.forOwn(validQueries, function(value, key) {
      sqlWhere.push(key + "='" + value + "'");
    });
    sql += sqlWhere.join(" AND ");
  }
  return sql;
};

var getWhereClause = function(params) {
  var whereClause = [
    translateStateToQuery(params.state),
    translateRaceToQuery(params.race),
    translateSexToQuery(params.sex),
    translateAgeToQuery(params.agegroup),
    "ESR IN (1, 2, 3)"
  ];
  whereClause = _.without(whereClause, "");
  return " WHERE " + whereClause.join(" AND ");
};

var translateStateToQuery = function(state) {
  lookup = {
    "AL": "01", "AK": "02", "AR": "04",
    "AR": "05", "CA": "06", "CO": "08",
    "CT": "09", "DE": "10", "DC": "11",
    "FL": "12", "GA": "13", "HI": "15",
    "ID": "16", "IL": "17", "IN": "18",
    "IA": "19", "KS": "20", "KY": "21",
    "LA": "22", "ME": "23", "MD": "24",
    "MA": "25", "MI": "26", "MN": "27",
    "MS": "28", "MO": "29", "MT": "30",
    "NE": "31", "NV": "32", "NH": "33",
    "NJ": "34", "NM": "35", "NY": "36",
    "NC": "37", "ND": "38", "OH": "39",
    "OK": "40", "OR": "41", "PA": "42",
    "RI": "44", "SC": "45", "SD": "46",
    "TN": "47", "TX": "48", "UT": "49",
    "VT": "50", "VA": "51", "WA": "53",
    "WV": "54", "WI": "55", "WY": "56",
    "PR": "72"
  }
  if(state=="") {
    return "";
  }
  return "ST='" + lookup[state] + "'";
};

var translateRaceToQuery = function(race) {
  if(race=="") {
    return "";
  }
  return {
    "white": "RAC1P=1 AND FHISP=0",
    "african american": "RAC1P=2 AND FHISP=0",
    "native american": "RAC1P IN (3, 4, 5) AND FHISP=0",
    "hispanic": "FHISP=1",
    "asian": "RAC1P=6 AND FHISP=0"
  }[race];
};

var translateSexToQuery = function(sex) {
  if(sex=="") {
    return "";
  }
  return {
    "male": "SEX=1",
    "female": "SEX=2"
  }[sex];
};

var translateAgeToQuery = function(agegroup) {
  if(agegroup=="") {
    return ""
  }
  return {
    "0-15": "AGEP <= 15",
    "16-25": "AGEP >= 16 AND AGEP <=25",
    "26-35": "AGEP >= 26 AND AGEP <=35",
    "36-45": "AGEP >= 36 AND AGEP <=45",
    "46-55": "AGEP >= 46 AND AGEP <=55",
    "55-65": "AGEP >= 56 AND AGEP <=65",
    "65+": "AGEP >= 65"
  }[agegroup];
};

var appendTranslatedWhereClause = function(sql, validQueries) {
  // console.log(validQueries);
  if(!_.isEmpty(validQueries)) {
    sql += getWhereClause(validQueries);
  }
  return sql;
};

var formatIncome = function(income) {
  return numeral(income).format("($0.00a)");
};

module.exports.getIncomeMean = function(event, callback) {

  var sql = "SELECT AVG(WAGP)*ADJINC/1000000 AS MEAN_INCOME FROM PUMS_2014_Persons";

  validQueries = _.pick(event, ["PUMA", "SEX", "RAC1P"]);
  sql = appendWhereClause(sql, validQueries);
  // console.log(sql);

  connection.query(sql, function(err, results, fields){
    var mean = results[0]["MEAN_INCOME"];
    return callback(err, {"mean": formatIncome(mean)});
	});

}

module.exports.getIncomeQuantiles = function(event, callback) {

  var sql = "SELECT QUANTILE, INCOME FROM PUMS_2014_Quantiles";

  validQueries = _.pick(event, ["state", "race", "sex", "agegroup"]);
  sql = appendWhereClause(sql, validQueries) + ";";

  connection.query(sql, function(err, results, fields){
    resultsObj = {};
    _.forEach(results, function(result) {
      resultsObj[result["QUANTILE"]] = result["INCOME"];
    })

    return callback(err, resultsObj);
	});

}

module.exports.getIncomeDistribution = function(event, callback) {

  var sql =
    "SELECT FLOOR((PERNP*ADJINC/1000000)/10000)*10000 AS BUCKET," +
    " COUNT(*) AS COUNT" +
    " FROM PUMS_2014_Persons";

  validQueries = _.pick(event, ["state", "race", "sex", "agegroup"]);
  sql = appendTranslatedWhereClause(sql, validQueries);
  sql += " GROUP BY BUCKET;";
  // return callback(null, sql);
  connection.query(sql, function(err, results, fields){
    resultsObj = {};
    total = _.sumBy(results, (function(result) {
      return result["COUNT"];
    }));
    _.forEach(results, function(result, i) {
      start = formatIncome(results[i]["BUCKET"]);
      end = formatIncome(results[i]["BUCKET"] + 10000);
      key = "" + start + "-" + end;
      // key = result["BUCKET"];
      resultsObj[key] = result["COUNT"]/total;
    })

    return callback(err, resultsObj);
	});

}
