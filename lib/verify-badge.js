'use strict';

var _ = require('lodash');

function verifyBadge(args, callback) {
  var seneca = this;
  var userId = args.userId;
  var badgeId = parseInt(args.badgeId);
  
  //Retrieve badge assertion object
  seneca.act({role:'cd-profiles', cmd: 'list', query:{userId: userId}}, function (err, response) {
    if(err) return callback(err);
    var profile = response[0];

    var badgeFound = _.find(profile.badges, function (badge) {
      return badge.id === badgeId;
    });

    return callback(null, badgeFound.assertion);
  });
}

module.exports = verifyBadge;

