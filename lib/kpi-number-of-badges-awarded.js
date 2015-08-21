'use strict';

var _ = require('lodash');

function kpiNumberOfBadgesAwarded(args, callback) {
  var seneca = this;
  var zenHostname = args.zenHostname;
  var user = args.user;

  var numberOfBadgesAwarded = 0;

  seneca.act({role: 'cd-profiles', cmd: 'list_query'}, function (err, profiles) {
    if(err) return callback(err);
    _.each(profiles, function (profile) {
      if(profile.badges) numberOfBadgesAwarded += profile.badges.length;
    });
    return callback(null, {numberOfBadgesAwarded: numberOfBadgesAwarded});
  });
}

module.exports = kpiNumberOfBadgesAwarded;

