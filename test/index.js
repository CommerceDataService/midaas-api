var app = require('../app');
var request = require('supertest')(app);
var chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect;
var _ = require('lodash');
var util = require('util');
var quantileController = require('../app/controllers/quantile')

chai.use(require('chai-sorted'));

describe('income', function() {
    describe('quantiles', function() {
        it('should have ascending values sorted in the same direction as the quantiles', function(done) {
          this.timeout(10000);
          process.env.MIDAAS_API_PORT = 9999;
          process.env.MIDAAS_API_USERNAME = 'foo';
          process.env.MIDAAS_API_PASSWORD = 'bar';
          request
            .get('/income/quantiles')
            .auth('foo', 'bar')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
              var quantiles = _.toPairs(res.body.overall);
              // pull just the values (income) from the quantiles
              var vals = _.map(quantiles, function(o) { return o[1]; });
              var vals_srt = _.chain(vals).clone().sortBy().value();

              // make sure some results came back
              expect(vals).to.have.length.above(5);

              expect(vals).to.deep.equal(vals_srt);

              done();
            });
        });
        it('should have same values in a compare query response as those produced from individual queries on that parameter',
        function(done){
          this.timeout(10000);
          process.env.MIDAAS_API_PORT = 9999;
          process.env.MIDAAS_API_USERNAME = 'foo';
          process.env.MIDAAS_API_PASSWORD = 'bar';
          request
            .get('/income/quantiles?state=DC&compare=sex')
            .auth('foo', 'bar')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
              var compQFemale = res.body.female;
              var compQMale = res.body.male;
              request
              .get('/income/quantiles?state=DC&sex=female')
              .auth('foo', 'bar')
              .set('Accept', 'application/json')
              .expect(200)
              .end(function(err, res){
                var qFemale = res.body.overall;
                request
                .get('/income/quantiles?state=DC&sex=male')
                .auth('foo', 'bar')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function(err, res){
                  var qMale = res.body.overall;
                  expect(compQFemale).to.deep.equal(qFemale);
                  expect(compQMale).to.deep.equal(qMale);
                  done();
                })
              })
            })
        })
    });
});

describe('queryBuilding', function(){
  it('should generate the correct sql statement for query on quantiles without any params and default to most recent year', function(done){
    var query = {};
    var statement = "SELECT QUANTILE, INCOME FROM PUMS_2014_Quantiles WHERE state='' AND sex='' AND agegroup='' AND race='' ORDER BY QUANTILE::INT ASC;";
    var generated = quantileController.buildSQL(query);
    expect(generated).to.equal(statement);
    done();
  });

  it('should generate the correct sql statement for query on quantiles with some params', function(done){
    var query = {
      sex: 'female',
      race: 'black',
      year: '2013'
    };
    var statement = "SELECT QUANTILE, INCOME FROM PUMS_2013_Quantiles WHERE sex='female' AND race='black' AND state='' AND agegroup='' ORDER BY QUANTILE::INT ASC;";
    var generated = quantileController.buildSQL(query);
    expect(generated).to.equal(statement);
    done();
  });

  it('should generate the correct sql statement for query on quantiles with a compare param', function(done){
    var query ={
      compare: 'race',
      state: 'CA'
    };
    var statement = "SELECT QUANTILE, INCOME, race FROM PUMS_2014_Quantiles WHERE state='CA' AND sex='' AND agegroup='' ORDER BY QUANTILE::INT ASC;";
    var generated = quantileController.buildSQL(query);
    expect(generated).to.equal(statement);
    done();
  });


});
