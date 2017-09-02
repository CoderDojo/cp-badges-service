const _ = require('lodash');

function kpiNumberOfBadgesAwarded(args, callback) {
  const seneca = this;
  const plugin = args.role;

  loadBadgeCategories()
    .then(countBadges)
    .then(numberOfBadgesAwarded => callback(null, numberOfBadgesAwarded))
    .catch(err => callback(null, { error: err }));

  function loadBadgeCategories() {
    return new Promise((resolve, reject) => {
      seneca.act({ role: plugin, cmd: 'loadBadgeCategories' }, (err, cat) => {
        if (err) reject(err);
        resolve(cat);
      });
    });
  }

  function countBadges(badgeCategories) {
    return new Promise((resolve, reject) => {
      const numberOfBadgesAwarded = { total: 0 };
      seneca.act({ role: 'cd-profiles', cmd: 'list' }, (err, profiles) => {
        if (err) reject(err);
        _.each(profiles, (profile) => {
          _.each(profile.badges, (badge) => {
            _.each(badgeCategories.categories, (category) => {
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
        resolve(numberOfBadgesAwarded);
      });
    });
  }
}

module.exports = kpiNumberOfBadgesAwarded;
