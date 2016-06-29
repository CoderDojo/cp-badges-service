'use strict';

var _ = require('lodash');
var async = require('async');

function claimBadge (args, callback) {
  var seneca = this;
  var plugin = args.role;
  var options = seneca.export('options');
  if (!args.badge) return callback(null, { error: 'Invalid request. No badge received.' });
  var badge = args.badge;
  var requestingUser = args.user;
  var claimCodePrefix = options.claimCodePrefix;
  var proxiedUser = args.userId; // Very likely to be their children

  badge.status = 'accepted';
  badge.dateAccepted = new Date();

  async.waterfall([
    checkProxyClaim,
    awardBadge
  ]);

  /**
   * [checkProxyClaim check if the requesting user is having any link to the awarded user]
   * @param  {Function} cb waterfall callback
   * @return {}         the requested user is global (var requestingUser), though the use of an empty response
   */
  function checkProxyClaim (cb){
    if (proxiedUser) {
      var params = {};
      params.userId = proxiedUser;
      seneca.act({role: 'cd-users', cmd: 'is_parent_of', user: requestingUser, params: params }, function (err, response){
        if(response.allowed === true){
          requestingUser.id = proxiedUser;
          cb();
        }else {
          callback(null, {ok: false, error: 'You cannot claim for somebody else but your own children'});
        }
      });
    } else {
      cb();
    }
  }

  /**
   * [awardBadge add a badge to the targetUser's list of badges]
   * @param  {Function} cb waterfall callback
   */
  function awardBadge (cb) {
    seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: requestingUser.id}}, function (err, response) {
      if (err) return callback(err);
      seneca.act({role: plugin, cmd: 'addBadgeToProfile', profile: response[0], badge: badge}, function (err, response) {
        if (err) return callback(err);
        if (response.error) return callback(null, {error: response.error});
        return callback(null, response);
      });
    });
  }

}

module.exports = claimBadge;
