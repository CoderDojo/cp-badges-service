'use strict';

var _ = require('lodash');

function claimBadge (args, callback) {
  var seneca = this;
  var plugin = args.role;
  var options = seneca.export('options');
  if (!args.badge) return callback(null, { error: 'Invalid request. No badge received.' });
  var badge = args.badge;
  var requestingUser = args.user;
  var claimCodePrefix = options.claimCodePrefix;

  badge.status = 'accepted';
  badge.dateAccepted = new Date();

  seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: requestingUser.id}}, function (err, response) {
    if (err) return callback(err);
    seneca.act({role: plugin, cmd: 'addBadgeToProfile', profile: response[0], badge: badge}, function (err, response) {
      if (err) return callback(err);
      if (response.error) return callback(null, {error: response.error});
      return callback(null, response);
    });
  });
}

module.exports = claimBadge;
