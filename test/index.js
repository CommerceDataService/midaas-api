var app = require('../app');
var request = require('supertest')(app);
var chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect;
var _ = require('lodash');
var util = require('util');

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
    });
});
