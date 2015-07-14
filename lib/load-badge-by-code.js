'use strict';

var _ = require('lodash');

function loadBadgeByCode(args, callback) {
  var seneca = this;
  var plugin = args.role;
  var code = args.code;

  //Call the listBadges command with clientRequest set to false 
  //to ensure that the tags containing the badge code prefix are not filtered out.
  seneca.act({role: plugin, cmd: 'listBadges'}, {clientRequest: false}, function (err, response) {
    if(err) return callback(null, {error: err});
    var badgeByCode = _.find(response.badges, function (badge) {
      return _.find(badge.tags, function (tag) {
        return tag.value === code;
      });
    });
    return callback(null, {badge: badgeByCode});
  });
}

module.exports = loadBadgeByCode;

