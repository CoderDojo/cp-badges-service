'use strict';

var _ = require('lodash');
var async = require('async');

function kpiNumberOfBadgesAwarded (args, callback) {
  var seneca = this;
  var plugin = args.role;

  async.waterfall([
    loadBadgeCategories,
    countBadges
  ], function (err, numberOfBadgesAwarded) {
    if (err) return callback(null, {error: err});
    return callback(null, numberOfBadgesAwarded);
  });

  function loadBadgeCategories (done) {
    seneca.act({role: plugin, cmd: 'loadBadgeCategories'}, done);
  }

  function countBadges (badgeCategories, done) {
    var numberOfBadgesAwarded = {total: 0};
    seneca.act({role: 'cd-profiles', cmd: 'list'}, function (err, profiles) {
      if (err) return callback(err);
      _.each(profiles, function (profile) {
        _.each(profile.badges, function (badge) {
          _.each(badgeCategories.categories, function (category) {
            var categoryFound = _.find(badge.tags, function (tag) {
              return tag.value === category;
            });
            if (categoryFound) {
              if (!numberOfBadgesAwarded[categoryFound.value]) numberOfBadgesAwarded[categoryFound.value] = 0;
              numberOfBadgesAwarded[categoryFound.value] += 1;
              numberOfBadgesAwarded.total += 1;
            }
          });
        });
      });
      return done(null, numberOfBadgesAwarded);
    });
  }
}

module.exports = kpiNumberOfBadgesAwarded;
