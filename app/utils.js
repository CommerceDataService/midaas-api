var _       = require("lodash");
var numeral = require("numeraljs");


var buildQuantileSQL = function(queryParams) {
  if (!queryParams["year"]){
    queryParams["year"] = 'current';
  }
  var compare = queryParams.compare;
  if(compare && compare !== "") {
    delete queryParams[compare];
    delete queryParams["compare"];
    var sql = "SELECT QUANTILE, INCOME, " + compare + " FROM ";
    sql = appendWhereClause(sql, queryParams, compare) + " ORDER BY QUANTILE::INT ASC;";
    return sql;
  } else {
    delete queryParams["compare"];
    var sql = "SELECT QUANTILE, INCOME FROM ";
    sql = appendWhereClause(sql, queryParams) + " ORDER BY QUANTILE::INT ASC;";
    return sql;
    }
};

var translateStateToQuery = function(state) {
  var lookup = {
    "AL": "01", "AK": "02", "AZ": "04",
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
  };
  var stateValue = lookup[state];
  if(stateValue) {
    return "ST='" + lookup[state] + "'";
  }
  return undefined;
};

var translateRaceToQuery = function(race) {
  return {
    "white": "RAC1P=1 AND HISP='01'",
    "black": "RAC1P=2 AND HISP='01'",
    "hispanic": "NOT HISP='01'",
    "asian": "RAC1P=6 AND HISP='01'"
  }[race];
};

var translateSexToQuery = function(sex) {
  return {
    "male": "SEX=1",
    "female": "SEX=2"
  }[sex];
};

var translateAgegroupToQuery = function(agegroup) {
  return {
    "18-24": "AGEP >= 18 AND AGEP <= 24",
    "25-34": "AGEP >= 25 AND AGEP <= 34",
    "35-44": "AGEP >= 35 AND AGEP <= 44",
    "45-54": "AGEP >= 45 AND AGEP <= 54",
    "55-64": "AGEP >= 55 AND AGEP <= 64",
    "65+": "AGEP >= 65"
  }[agegroup];
};

var translateQuantileToQuery = function(quantile) {
  intQuantile = parseInt(quantile);
  if(intQuantile >= 0 && intQuantile <= 100) {
    return "QUANTILE='" + quantile + "'";
  } else {
    return undefined;
  }
};

var translateYearToQuery = function(year){
  yearsArray = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
  if (year == 'current'){
    year = _.max(yearsArray)
  }else {
    year = parseInt(year);
  }
  if(_.includes(yearsArray, year)){
    return table = {quantiles: "PUMS_"+year+"_Quantiles",
                    persons: "PUMS_"+year+"_Persons"};
  } else {
    return undefined;
  }
};

var validateQueryParams = function(queryParams, callback) {
  // return an error callback if we encounter any issues
  state = queryParams["state"];
  if(state && !translateStateToQuery(state)) {
    return callback(new Error("Invalid value (" + state + ") supplied for state. " +
      "Please see https://midaas.commerce.gov/developers/ for documentation."));
  }
  race = queryParams["race"];
  if(race && !translateRaceToQuery(race)) {
    return callback(new Error("Invalid value (" + race + ") supplied for race. " +
      "Please see https://midaas.commerce.gov/developers/ for documentation."));
  }
  sex = queryParams["sex"];
  if(sex && !translateSexToQuery(sex)) {
    return callback(new Error("Invalid value (" + sex + ") supplied for sex. " +
      "Please see https://midaas.commerce.gov/developers/ for documentation."));
  }
  agegroup = queryParams["agegroup"];
  if(agegroup && !translateAgegroupToQuery(agegroup)) {
    return callback(new Error("Invalid value (" + agegroup + ") supplied for agegroup. " +
      "Please see https://midaas.commerce.gov/developers/ for documentation."));
  }
  quantile = queryParams["quantile"];
  if(quantile && !translateQuantileToQuery(quantile)) {
    return callback(new Error("Invalid value (" + quantile + ") supplied for quantile. " +
      "Please see https://midaas.commerce.gov/developers/ for documentation."));
  }
  compare = queryParams["compare"];
  if(compare && !_.includes(["state", "race", "sex", "agegroup"], compare)) {
    return callback(new Error("Invalid value (" + compare + ") supplied for compare. " +
      "Please see https://midaas.commerce.gov/developers/ for documentation."));
  }
  year = queryParams["year"];
  if(year && !translateYearToQuery(year)){
    return callback(new Error("Invalid value(" + year +") supplied for year. " +
    "Please see https://midaas.commerce.gov/developers/ for documentation."))
  }
  // return successfully if we haven't
  return callback();
};

var appendWhereClause = function(sql, queryParams, compare) {
  sql += translateYearToQuery(queryParams["year"]).quantiles;
  delete queryParams["year"];
  var defaultParams = {
    'state': '',
    'sex': '',
    'agegroup': '',
    'race': ''
  };
  sql += " WHERE ";
  sqlWhere = [];
  defaultParams = _.omit(defaultParams, [compare])
  _.forOwn(queryParams, function(value, key) {
    if (!(key.toLowerCase() === "quantile" && value === "")) {
      defaultParams= _.omit(defaultParams, [key]);
      sqlWhere.push(key + "='" + value + "'");
    }
  });
  _.forOwn(defaultParams, function(value, key){
      sqlWhere.push(key + "='" + value + "'");
  })
  sql += sqlWhere.join(" AND ");
  return sql;
};

var getTranslatedWhereClause = function(queryParams) {
  var whereClause = [
    translateStateToQuery(queryParams["state"]),
    translateRaceToQuery(queryParams["race"]),
    translateSexToQuery(queryParams["sex"]),
    translateAgegroupToQuery(queryParams["agegroup"]),
    "ESR IN (1, 2, 3)",
    "AGEP >= 18"
  ];
  whereClause = _.compact(whereClause);
  return " WHERE " + whereClause.join(" AND ");
};

var appendTranslatedWhereClause = function(sql, queryParams) {
  sql += translateYearToQuery(queryParams["year"]).persons;
  delete queryParams["year"];
  if(!_.isEmpty(queryParams)) {
    sql += getTranslatedWhereClause(queryParams);
  }
  return sql;
};

var formatIncome = function(income) {
  return numeral(income).format("($0.00a)");
};


module.exports.buildQuantileSQL = buildQuantileSQL;
module.exports.appendWhereClause = appendWhereClause;
module.exports.appendTranslatedWhereClause = appendTranslatedWhereClause;
module.exports.validateQueryParams = validateQueryParams;
module.exports.formatIncome = formatIncome;
