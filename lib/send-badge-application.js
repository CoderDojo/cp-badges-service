'use strict';

var async = require('async');
var moment = require('moment');
var _ = require('lodash');

function sendBadgeApplication (args, callback) {
  var seneca = this;
  var plugin = args.role;
  var zenHostname = args.zenHostname;
  var applicationData = args.applicationData;
  var badge = applicationData.badge;
  var earner = applicationData.user;
  var emailSubject = applicationData.emailSubject;
  var requestingUser = args.user;
  var protocol = process.env.PROTOCOL || 'http';

  if (earner.id === requestingUser.id) return callback(null, {error: "You can't request a badge application for your own user account."});

  async.waterfall([
    saveBadgeToUserProfile,
    loadUserParent,
    sendEarnerEmail
  ], function (err, res) {
    if (err) return callback(null, {error: err});
    return callback(null, res);
  });

  function saveBadgeToUserProfile (done) {
    // Mark as pending because the user must accept the badge via email.
    badge.status = 'pending';
    // Use list_query command instead because cmd_list has security checks and adds unnecessary fields.
    seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: earner.id}}, function (err, response) {
      if (err) return done(err);
      seneca.act({role: plugin, cmd: 'addBadgeToProfile', profile: response[0], badge: badge}, function (err, response) {
        if (err) return done(err);
        if (response.error) return done(response.error);
        return done(null, response);
      });
    });
  }

  function loadUserParent (profile, done) {
    if (_.contains(earner.types, 'attendee-u13')) {
      if (profile && profile.parents && profile.parents.length > 0) {
        seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: profile.parents[0]}}, function (err, parentProfiles) {
          if (err) return done(err);
          var parentProfile = parentProfiles[0];
          return done(null, profile, parentProfile);
        });
      } else {
        return done(null, profile, {});
      }
    } else {
      return done(null, profile, {});
    }
  }

  function sendEarnerEmail (profile, parentProfile, done) {
    var recipientEmail;
    var emailCode;
    var locality = args.locality || 'en_US';

    if (!_.isEmpty(parentProfile)) {
      recipientEmail = parentProfile.email;
      emailCode = 'accept-badge-award-for-ninja-u13-';
    } else {
      recipientEmail = profile.email;
      emailCode = 'accept-badge-award-';
    }

    var payload = {
      to: recipientEmail,
      code: emailCode,
      locality: locality,
      subject: emailSubject,
      content: {
        badgeName: badge.name,
        badgeImage: badge.imageUrl,
        recipientName: profile.name,
        link: protocol + '://' + zenHostname + '/dashboard/badges/accept/' + earner.id + '/' + badge.slug,
        year: moment(new Date()).format('YYYY')
      }
    };
    seneca.act({role: 'cd-dojos', cmd: 'send_email', payload: payload}, done);
  }
}

module.exports = sendBadgeApplication;
