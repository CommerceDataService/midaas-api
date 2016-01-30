import json
import MySQLdb
import numpy
import weighted

with open("./rds-config.json") as rdsConfigFile:
    config = json.load(rdsConfigFile)

conn = MySQLdb.connect(config["host"], config["user"], config["password"], config["database"])
cursor = conn.cursor()

def printQuantile(quantile):
    # NOTE: please see
    # http://www2.census.gov/programs-surveys/acs/tech_docs/pums/data_dict/PUMSDataDict14.pdf
    # for column identifiers

    # select all records matching the
    # valid ESR (employment status recode)
    cursor.execute("""
        SELECT
            PERNP, PWGTP, ADJINC
        FROM
            PUMS_2014_Persons
        WHERE
            ST=45 AND
            # PUMA=00100 AND
            # RAC1P=2 AND
            ESR IN (1, 2, 3)
    """)

    results = cursor.fetchall()
    r = numpy.asarray(results, dtype=float)
    pernp = r[:, 0] * r[:, 2] / 1000000
    pwgtp = r[:, 1]
    quantValue = weighted.quantile(pernp, pwgtp, quantile)
    print "%s quantile: %s" % (quantile, quantValue)

quantiles = [0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99, 1]
printQuantile(quantiles[5])

# for row in results:
#     print "puma=%s, esr=%s, rac1p=%s, pernp=%s, pwgtp=%s" % row

conn.close()
