const async = require('async');

function claimBadge(args, callback) {
  const seneca = this;
  const plugin = args.role;
  if (!args.badge) return callback(null, { error: 'Invalid request. No badge received.' });
  const badge = args.badge;
  const requestingUser = args.user;
  const proxiedUser = args.userId; // Very likely to be their children

  badge.status = 'accepted';
  badge.dateAccepted = new Date();

  async.waterfall([checkProxyClaim, awardBadge]);

  /**
   * [checkProxyClaim check if the requesting user is having any link to the awarded user]
   * @param  {Function} cb waterfall callback
   * @return {} the requested user is global (requestingUser), though the use of an empty response
   */
  function checkProxyClaim(cb) {
    if (proxiedUser) {
      const params = {};
      params.userId = proxiedUser;
      seneca.act(
        { role: 'cd-users', cmd: 'is_parent_of', user: requestingUser, params },
        (err, response) => {
          if (response.allowed === true) {
            requestingUser.id = proxiedUser;
            cb();
          } else {
            callback(null, {
              ok: false,
              error: 'You cannot claim for somebody else but your own children',
            });
          }
        },
      );
    } else {
      cb();
    }
  }

  /**
   * [awardBadge add a badge to the targetUser's list of badges]
   * @param  {Function} cb waterfall callback
   */
  function awardBadge(cb) {
    seneca.act(
      {
        role: 'cd-profiles',
        cmd: 'list',
        query: { userId: requestingUser.id },
      },
      (err, profiles) => {
        if (err) return cb(err);
        seneca.act(
          {
            role: plugin,
            cmd: 'addBadgeToProfile',
            profile: profiles[0],
            badge,
          },
          (error, response) => {
            if (error) return cb(error);
            if (response.error) return callback(null, { error: response.error });
            return cb(null, response);
          },
        );
      },
    );
  }
}

module.exports = claimBadge;
