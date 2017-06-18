'use strict';

const async = require('async');
const _ = require('lodash');

function kpiNumberOfBadgesPublished (args, callback) {
  const seneca = this;
  const plugin = args.role;

  async.waterfall([
    loadBadgeCategories,
    countPublishedBadges,
  ], (err, kpiData) => {
    if (err) return callback(null, {error: err});
    return callback(null, kpiData);
  });

  function loadBadgeCategories (done) {
    seneca.act({role: plugin, cmd: 'loadBadgeCategories'}, done);
  }

  function countPublishedBadges (badgeCategories, done) {
    const kpiData = {total: 0};
    seneca.act({role: plugin, cmd: 'listBadges'}, (err, data) => {
      if (err) return done(err);
      const badges = data.badges;
      _.each(badgeCategories.categories, (category) => {
        _.each(badges, (badge) => {
          const categoryFound = _.find(badge.tags, (tag) => {
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
