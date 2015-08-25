'use strict'

var seneca = require('seneca')();
var _ = require('lodash');
var expect = require('chai').expect;
var lab = exports.lab = require('lab').script();
var plugin = 'cd-badges';

var kpiNumberOfBadgesAwarded = require('../lib/kpi-number-of-badges-awarded');
var loadBadgeCategories = require('../lib/load-badge-categories');

seneca.use('./stubs/cd-profiles.js');
seneca.add({role: plugin, cmd: 'kpiNumberOfBadgesAwarded'}, kpiNumberOfBadgesAwarded.bind(seneca));
seneca.add({role: plugin, cmd: 'loadBadgeCategories'}, loadBadgeCategories.bind(seneca));

lab.experiment('KPI', function () {
  lab.test('Number of Badges Awarded', function (done) {
    seneca.act({role: plugin, cmd: 'kpiNumberOfBadgesAwarded'}, function (err, kpiData) {
      if(err) return done(err);
      expect(kpiData).to.have.property('total').that.is.a('number');
      _.each(Object.keys(kpiData), function (field) {
        expect(kpiData).to.have.property(field).that.is.a('number');
      });
      return done();
    });
  });    
});