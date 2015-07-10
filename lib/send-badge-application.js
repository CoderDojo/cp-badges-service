'use strict';

var async = require('async');
var moment = require('moment');
var _ = require('lodash');

function sendBadgeApplication(args, callback) {
  var seneca = this;
  var zenHostname = args.zenHostname;
  var applicationData = args.applicationData;
  var badge = applicationData.badge;
  var earner = applicationData.user;
 
  async.waterfall([
    saveBadgeToUserProfile,
    sendEarnerEmail
  ], function (err, res) {
    if(err) return callback(null, {error: err.message});
    return callback(null, res);
  });

  function saveBadgeToUserProfile(done) {
    //Mark as pending because the user must accept the badge via email.
    badge.status = 'pending';
    //Use list_query command instead because cmd_list has security checks and adds unnecessary fields.
    seneca.act({role: 'cd-profiles', cmd: 'list_query', query:{userId: earner.id}}, function (err, response) {
      if(err) return done(err);
      var profile = response[0];
      if(!profile.badges) profile.badges = [];
      var badgeFound = _.find(profile.badges, function (userBadge) {
        return userBadge.id === badge.id;
      });
      if(badgeFound) return done(new Error('User has already received this badge.'));
      profile.badges.push(badge);
      seneca.act({role: 'cd-profiles', cmd: 'save', profile: profile}, done);
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

