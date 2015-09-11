'use strict';

var async = require('async');
var _ = require('lodash');

function kpiNumberOfBadgesPublished (args, callback) {
  var seneca = this;
  var plugin = args.role;

  async.waterfall([
    loadBadgeCategories,
    countPublishedBadges
  ], function (err, kpiData) {
    if (err) return callback(null, {error: err});
    return callback(null, kpiData);
  });

  function loadBadgeCategories (done) {
    seneca.act({role: plugin, cmd: 'loadBadgeCategories'}, done);
  }

  function countPublishedBadges (badgeCategories, done) {
    var kpiData = {total: 0};
    seneca.act({role: plugin, cmd: 'listBadges'}, function (err, data) {
      if (err) return done(err);
      var badges = data.badges;
      _.each(badgeCategories.categories, function (category) {
        _.each(badges, function (badge) {
          var categoryFound = _.find(badge.tags, function (tag) {
            return tag.value === category;
          });
          if (categoryFound) {
            if (!kpiData[categoryFound.value]) kpiData[categoryFound.value] = 0;
            kpiData[categoryFound.value] += 1;
            kpiData.total += 1;
          }
        });
      });
      return done(null, kpiData);
    });
  }
}

module.exports = kpiNumberOfBadgesPublished;
