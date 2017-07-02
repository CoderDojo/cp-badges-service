const _ = require('lodash');
const async = require('async');

function kpiNumberOfBadgesAwarded(args, callback) {
  const seneca = this;
  const plugin = args.role;

  async.waterfall([
    loadBadgeCategories,
    countBadges,
  ], (err, numberOfBadgesAwarded) => {
    if (err) return callback(null, { error: err });
    return callback(null, numberOfBadgesAwarded);
  });

  function loadBadgeCategories(done) {
    seneca.act({ role: plugin, cmd: 'loadBadgeCategories' }, done);
  }

  function countBadges(badgeCategories, done) {
    const numberOfBadgesAwarded = { total: 0 };
    seneca.act({ role: 'cd-profiles', cmd: 'list' }, (err, profiles) => {
      if (err) return callback(err);
      _.each(profiles, profile => {
        _.each(profile.badges, badge => {
          _.each(badgeCategories.categories, category => {
            const categoryFound = _.find(badge.tags, tag => tag.value === category);
            if (categoryFound) {
              if (!numberOfBadgesAwarded[categoryFound.value]) {
                numberOfBadgesAwarded[categoryFound.value] = 0;
              }
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
