import json
import MySQLdb
import numpy
import weighted

with open("./local-config.json") as rdsConfigFile:
# with open("./rds-config.json") as rdsConfigFile:
    config = json.load(rdsConfigFile)

db = MySQLdb.connect(config["host"], config["user"], config["password"], config["database"])
cursor = db.cursor()

def getQuantileIncome(quantile, state, race, sex, agegroup):
    # NOTE: please see
    # http://www2.census.gov/programs-surveys/acs/tech_docs/pums/data_dict/PUMSDataDict14.pdf
    # for column identifiers

    # select all records matching the valid criteria
    query = """
        SELECT
            PERNP, PWGTP, ADJINC
        FROM
            PUMS_2014_Persons
    """
    query += getWhereClause(state, race, sex, agegroup)
    cursor.execute(query)

    # fetch all results and compute the quantile value
    results = cursor.fetchall()
    r = numpy.asarray(results, dtype=float)
    if len(r) > 0:
        pernp = r[:, 0]# * r[:, 2] / 1000000
        pwgtp = r[:, 1]
        return weighted.quantile(pernp, pwgtp, quantile)
    else:
        return 0

def insertQuartileData(quantile, state, race, sex, agegroup):
    income = getQuantileIncome(quantile, state, race, sex, agegroup)
    quantileDataList = (int(quantile * 100), "", state, race, sex, agegroup, income)
    valuesString = "(%s, '%s', '%s', '%s', '%s', '%s', %s)" % quantileDataList
    command = """
        INSERT INTO
            PUMS_2014_Quantiles(QUANTILE, PUMA, STATE, RACE, SEX, AGEGROUP, INCOME)
        VALUES
    """
    command += valuesString
    try:
       cursor.execute(command)
       db.commit()
       print "committed %s" % (valuesString)
    except:
       # Rollback in case there is any error
       db.rollback()

def getWhereClause(state, race, sex, agegroup):
    whereClause = [
        translateStateToQuery(state),
        translateRaceToQuery(race),
        translateSexToQuery(sex),
        translateAgeToQuery(agegroup),
        "ESR IN (1, 2, 3)"
    ]
    return "WHERE " + " AND ".join(filter(None, whereClause))

def translateStateToQuery(state):
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
    if state is "":
        return ""
    return "ST='%s'" % (lookup[state])

def translateRaceToQuery(race):
    if race is "":
        return ""
    return {
        "white": "RAC1P=1 AND FHISP=0",
        "african american": "RAC1P=2 AND FHISP=0",
        "native american": "RAC1P IN (3, 4, 5) AND FHISP=0",
        "hispanic": "FHISP=1",
        "asian": "RAC1P=6 AND FHISP=0"
    }[race]

def translateSexToQuery(sex):
    if sex is "":
        return ""
    return {
        "male": "SEX=1",
        "female": "SEX=2"
    }[sex]

def translateAgeToQuery(agegroup):
    if agegroup is "":
        return ""
    return {
        "0-15": "AGEP <= 15",
        "16-25": "AGEP >= 16 AND AGEP <=25",
        "26-35": "AGEP >= 26 AND AGEP <=35",
        "36-45": "AGEP >= 36 AND AGEP <=45",
        "46-55": "AGEP >= 46 AND AGEP <=55",
        "55-65": "AGEP >= 56 AND AGEP <=65",
        "65+": "AGEP >= 65"
    }[agegroup]

quantiles = [
    0.05, 0.1, 0.2, 0.3, 0.4, 0.5,
    0.6, 0.7, 0.8, 0.9, 0.95, 0.99
]
states = [
    "",
    "AL", "AK", "AR", "AR", "CA", "CO", "CT", "DE",
    "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
    "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
    "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
    "WV", "WI", "WY", "PR"
]
races = [
    # "",
    "white", "african american", "native american",
    "hispanic", "asian"
]
sexes = [
    # "",
    "male", "female"
]
agegroups = [
    # "",
    "0-15", "16-25", "26-35", "36-45", "46-55",
    "55-65", "65+"
]

for state in states:
    for quantile in quantiles:
        upsertQuantileData(quantile, state, "", "", "")

for state in states:
    for quantile in quantiles:
        for race in races:
            upsertQuantileData(quantile, state, race, "", "")
        for sex in sexes:
            upsertQuantileData(quantile, state, "", sex, "")
        for agegroup in agegroups:
            upsertQuantileData(quantile, state, "", "", agegroup)

db.close()
