'use strict';

function ownBadge (args, callback) {
    var seneca = this;
    var requestUser = args.user.id;
    var badgeUser = args.params.badgeData.userId;
    var validity = false;
    if (requestUser === badgeUser) {
      validity = true;
    }
    return callback(null, {'allowed': validity});
}

module.exports = ownBadge;
