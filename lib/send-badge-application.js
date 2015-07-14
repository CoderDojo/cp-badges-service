'use strict';

var async = require('async');
var moment = require('moment');
var _ = require('lodash');

function sendBadgeApplication(args, callback) {
  var seneca = this;
  var plugin = args.role;
  var zenHostname = args.zenHostname;
  var applicationData = args.applicationData;
  var badge = applicationData.badge;
  var earner = applicationData.user;
  var requestingUser = args.user;

  if(earner.id === requestingUser.id) return callback(null, {error: "You can't request a badge application for your own user account."});

  async.waterfall([
    saveBadgeToUserProfile,
    sendEarnerEmail
  ], function (err, res) {
    if(err) return callback(null, {error: err});
    return callback(null, res);
  });

  function saveBadgeToUserProfile(done) {
    //Mark as pending because the user must accept the badge via email.
    badge.status = 'pending';
    //Use list_query command instead because cmd_list has security checks and adds unnecessary fields.
    seneca.act({role: 'cd-profiles', cmd: 'list_query', query:{userId: earner.id}}, function (err, response) {
      if(err) return done(err);
      seneca.act({role: plugin, cmd: 'addBadgeToProfile', profile: response[0], badge: badge}, function (err, response) {
        if(response.error) return done(response.error);
        return done(null, response);
      });
    });
  }

  function sendEarnerEmail(profile, done) {
    var learnerEmail = earner.email;
    var payload = {
      to:learnerEmail,
      code:'accept-badge-award',
      content:{
        badgeName: badge.name,
        badgeImage: badge.imageUrl,
        link: 'http://' + zenHostname + '/dashboard/badges/accept/' + earner.id + '/' + badge.slug,
        year: moment(new Date()).format('YYYY')
      }
    };
    seneca.act({role:'cd-dojos', cmd:'send_email', payload:payload}, done);
  }

}

module.exports = sendBadgeApplication;

