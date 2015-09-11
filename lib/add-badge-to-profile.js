'use strict';

var _ = require('lodash');

function addBadgeToProfile (args, callback) {
  var seneca = this;
  var profile = args.profile;
  var badge = args.badge;
  if (!profile.badges) profile.badges = [];
  var badgeFound = _.find(profile.badges, function (userBadge) {
    return userBadge.id === badge.id;
  });
  if (badgeFound) return callback(null, { error: 'User has already received this badge.' });
  profile.badges.push(badge);
  seneca.act({ role: 'cd-profiles', cmd: 'save', profile: profile }, callback);
}

module.exports = addBadgeToProfile;
