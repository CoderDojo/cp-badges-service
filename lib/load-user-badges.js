'use strict';

function loadUserBadges (args, callback) {
  var seneca = this;
  var userId = args.userId;

  // Retrieve the badges through the cd_profiles cmd_list action to apply security checks.
  seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: userId}}, function (err, response) {
    if (err) return callback(err);
    var badges = response.badges;
    return callback(null, badges);
  });
}

module.exports = loadUserBadges;
