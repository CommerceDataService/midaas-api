import json
import psycopg2
import numpy
import weighted

# with open("./local-config.json") as rdsConfigFile:
with open("./redshift-config.json") as rdsConfigFile:
    config = json.load(rdsConfigFile)

conn = psycopg2.connect(host=config["host"], user=config["user"], password=config["password"], dbname=config["database"], port=config["port"])
cursor = conn.cursor()

def getQuantileIncome(quantile, state, race, sex, agegroup):
    # NOTE: please see
    # http://www2.census.gov/programs-surveys/acs/tech_docs/pums/data_dict/PUMSDataDict14.pdf
    # for column identifiers

    # select all records matching the valid criteria
    query = """
        SELECT
            PERNP, PWGTP
        FROM
            PUMS_2014_Persons
    """
    query += getWhereClause(state, race, sex, agegroup)
    cursor.execute(query)

    # fetch all results and compute the quantile value
    results = cursor.fetchall()
    r = numpy.asarray(results, dtype=float)
    if len(r) > 0:
        pernp = r[:, 0]
        pwgtp = r[:, 1]
        return int(round(weighted.quantile(pernp, pwgtp, quantile),-2))
    else:
        return 0

def insertQuantileData(quantile, state, race, sex, agegroup):
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
       conn.commit()
       print "committed %s" % (valuesString)
    except:
       # Rollback in case there is any error
       conn.rollback()

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
    }
    if state is "":
        return ""
    return "ST='%s'" % (lookup[state])

def translateRaceToQuery(race):
    if race is "":
        return ""
    return {
        "white": "RAC1P=1 AND HISP='01'",
        "black": "RAC1P=2 AND HISP='01'",
        "hispanic": "NOT HISP='01'",
        "asian": "RAC1P=6 AND HISP='01'"
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
        # "0-17": "AGEP <= 17",
        "18-24": "AGEP >= 18 AND AGEP <= 24",
        "25-34": "AGEP >= 25 AND AGEP <= 34",
        "35-44": "AGEP >= 35 AND AGEP <= 44",
        "45-54": "AGEP >= 45 AND AGEP <= 54",
        "55-64": "AGEP >= 55 AND AGEP <= 64",
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
    "WV", "WI", "WY"
]
races = [
    # "",
    "white", "black", "hispanic", "asian"
]
sexes = [
    # "",
    "male", "female"
]
agegroups = [
    # "",
    # "0-17",
    "18-24", "25-34",
    "35-44", "45-54",
    "55-64", "65+"
]

for state in states:
    for quantile in quantiles:
        insertQuantileData(quantile, state, "", "", "")

for state in states:
    for quantile in quantiles:
        for race in races:
            insertQuantileData(quantile, state, race, "", "")
        for sex in sexes:
            insertQuantileData(quantile, state, "", sex, "")
        for agegroup in agegroups:
            insertQuantileData(quantile, state, "", "", agegroup)

# for state in states:
#     for quantile in quantiles:
#         for race in races:
#             for sex in sexes:
#                 for agegroup in agegroups:
#                     insertQuantileData(quantile, state, race, sex, agegroup)

conn.close()
