/**
 * Utils
 */

var _       = require("lodash");
var numeral = require("numeraljs");

/***************************************************************
                          METHODS
 ***************************************************************/

var translateStateToQuery = function(state) {
  var lookup = {
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
  };
  var stateValue = lookup[state];
  if(stateValue) {
    return "ST='" + lookup[state] + "'";
  }
  return undefined;
};

var translateRaceToQuery = function(race) {
  return {
    "white": "RAC1P=1 AND FHISP=0",
    "african american": "RAC1P=2 AND FHISP=0",
    "black": "RAC1P=2 AND FHISP=0",
    "native american": "RAC1P IN (3, 4, 5) AND FHISP=0",
    "hispanic": "FHISP=1",
    "asian": "RAC1P=6 AND FHISP=0"
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
    "0-15": "AGEP <= 15",
    "16-25": "AGEP >= 16 AND AGEP <=25",
    "26-35": "AGEP >= 26 AND AGEP <=35",
    "36-45": "AGEP >= 36 AND AGEP <=45",
    "46-55": "AGEP >= 46 AND AGEP <=55",
    "55-65": "AGEP >= 56 AND AGEP <=65",
    "65+": "AGEP >= 65"
  }[agegroup];
};

var validateQueryParams = function(queryParams, callback) {
  // return an error callback if we encounter any issues
  state = queryParams["state"];
  if(state && !translateStateToQuery(state)) {
    return callback(new Error("Invalid value (" + state + ") supplied for state. " +
      "Please see https://github.com/presidential-innovation-fellows/midaas-api for documentation."));
  }
  race = queryParams["race"];
  if(race && !translateRaceToQuery(race)) {
    return callback(new Error("Invalid value (" + race + ") supplied for race. " +
      "Please see https://github.com/presidential-innovation-fellows/midaas-api for documentation."));
  }
  sex = queryParams["sex"];
  if(sex && !translateSexToQuery(sex)) {
    return callback(new Error("Invalid value (" + sex + ") supplied for sex. " +
      "Please see https://github.com/presidential-innovation-fellows/midaas-api for documentation."));
  }
  agegroup = queryParams["agegroup"];
  if(agegroup && !translateAgegroupToQuery(agegroup)) {
    return callback(new Error("Invalid value (" + agegroup + ") supplied for agegroup. " +
      "Please see https://github.com/presidential-innovation-fellows/midaas-api for documentation."));
  }
  compare = queryParams["compare"];
  if(compare && !_.includes(["state", "race", "sex", "agegroup"], compare)) {
    return callback(new Error("Invalid value (" + compare + ") supplied for compare. " +
      "Please see https://github.com/presidential-innovation-fellows/midaas-api for documentation."));
  }
  // return successfully if we haven't
  return callback();
}

var appendWhereClause = function(sql, queryParams) {
  // NOTE: need to query with "" (empty strings to be inclusive)
  // of parameters that we aren't querying on
  // console.log(queryParams);
  if(!_.isEmpty(queryParams)) {
    sql += " WHERE ";
    sqlWhere = [];
    _.forOwn(queryParams, function(value, key) {
      sqlWhere.push(key + "='" + value + "'");
    });
    sql += sqlWhere.join(" AND ");
  }
  return sql;
};

var getTranslatedWhereClause = function(queryParams) {
  var whereClause = [
    translateStateToQuery(queryParams["state"]),
    translateRaceToQuery(queryParams["race"]),
    translateSexToQuery(queryParams["sex"]),
    translateAgegroupToQuery(queryParams["agegroup"]),
    "ESR IN (1, 2, 3)"
  ];
  whereClause = _.compact(whereClause);
  return " WHERE " + whereClause.join(" AND ");
};

var appendTranslatedWhereClause = function(sql, queryParams) {
  // console.log(queryParams);
  if(!_.isEmpty(queryParams)) {
    sql += getTranslatedWhereClause(queryParams);
  }
  return sql;
};

var formatIncome = function(income) {
  return numeral(income).format("($0.00a)");
};

/***************************************************************
                          EXPORTS
 ***************************************************************/

module.exports.appendWhereClause = appendWhereClause;
module.exports.appendTranslatedWhereClause = appendTranslatedWhereClause;
module.exports.validateQueryParams = validateQueryParams;
module.exports.formatIncome = formatIncome;
