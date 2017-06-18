'use strict';

const _ = require('lodash');

function addBadgeToProfile (args, callback) {
  const seneca = this;
  const profile = args.profile;
  const badge = args.badge;
  if (!profile.badges) profile.badges = [];
  const badgeFound = _.find(profile.badges, (userBadge) => {
    return userBadge.id === badge.id;
  });
  if (badgeFound) return callback(null, { error: 'User has already received this badge.' });
  profile.badges.push(badge);
  seneca.act({ role: 'cd-profiles', cmd: 'save', profile: profile }, callback);
}

module.exports = addBadgeToProfile;
