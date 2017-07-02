const seneca = require('seneca')();
const _ = require('lodash');
const expect = require('chai').expect;
const lab = require('lab').script();
exports.lab = require('lab').script();

const plugin = 'cd-badges';

const kpiNumberOfBadgesAwarded = require('../lib/kpi-number-of-badges-awarded');
const loadBadgeCategories = require('../lib/load-badge-categories');

seneca.use('./stubs/cd-profiles.js');
seneca.add({ role: plugin, cmd: 'kpiNumberOfBadgesAwarded' }, kpiNumberOfBadgesAwarded.bind(seneca));
seneca.add({ role: plugin, cmd: 'loadBadgeCategories' }, loadBadgeCategories.bind(seneca));

lab.experiment('KPI', () => {
  lab.test('Number of Badges Awarded', done => {
    seneca.act({ role: plugin, cmd: 'kpiNumberOfBadgesAwarded' }, (err, kpiData) => {
      if (err) return done(err);
      expect(kpiData).to.have.property('total').that.is.a('number');
      _.each(Object.keys(kpiData), field => {
        expect(kpiData).to.have.property(field).that.is.a('number');
      });
      return done();
    });
  });
});
