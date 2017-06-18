'use strict';

const _ = require('lodash');

function verifyBadge (args, callback) {
  const seneca = this;
  const userId = args.userId;
  const badgeId = parseInt(args.badgeId, 10);

  // Retrieve badge assertion object
  seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: userId}}, (err, response) => {
    if (err) return callback(err);
    const profile = response[0];

    const badgeFound = _.find(profile.badges, (badge) => {
      return badge.id === badgeId;
    });

    return callback(null, badgeFound.assertion);
  });
}

module.exports = verifyBadge;
