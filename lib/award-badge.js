const async = require('async');
const moment = require('moment');
const _ = require('lodash');

function sendBadgeApplication(args, callback) {
  const seneca = this;
  const plugin = args.role;
  const zenHostname = process.env.HOSTNAME || '127.0.0.1:8000';
  const protocol = process.env.PROTOCOL || 'http';
  const applicationData = args.applicationData;
  const badge = applicationData.badge;
  const earner = applicationData.user;
  const emailSubject = applicationData.emailSubject;
  const requestingUser = args.user;

  if (earner.id === requestingUser.id) {
    return callback(null, {
      error: "You can't request a badge application for your own user account.",
    });
  }

  async.waterfall([
    getEarnerUser,
    saveBadgeToUserProfile,
    loadUserParent,
    sendEarnerEmail,
  ], (err, res) => {
    if (err) return callback(null, { error: err });
    return callback(null, res);
  });

  function getEarnerUser(done) {
    seneca.act({ role: 'cd-users', cmd: 'load', id: earner.id }, (err, user) => {
      if (err) return callback(err);
      return done(null, user);
    });
  }

  function saveBadgeToUserProfile(user, done) {
    badge.status = 'accepted';
    badge.dateAccepted = new Date();

    // Add assertion for badge baking.
    badge.assertion = {
      uid: `coderdojo-${user.id}${badge.id}`,
      recipient: {
        identity: user.email,
        type: 'email',
        hashed: false,
      },
      badge: `http://badgekit.coderdojo.com:8080/public/systems/coderdojo/badges/${badge.slug}`,
      verify: {
        url: `${protocol}://${zenHostname}/api/1.0/verify_badge/${user.id}/${badge.id}/assertion`, // url should return badgeAssertion object.
        type: 'hosted',
      },
      issuedOn: new Date(),
    };

    if (applicationData.evidence) {
      badge.assertion.evidence = applicationData.evidence;
    }

    // Use list_query command instead because
    // cmd_list has security checks and adds unnecessary fields.
    seneca.act({
      role: 'cd-profiles',
      cmd: 'list',
      query: { userId: earner.id },
    }, (err, profiles) => {
      if (err) return done(err);
      seneca.act({
        role: plugin,
        cmd: 'addBadgeToProfile',
        profile: profiles[0],
        badge,
      }, (error, response) => {
        if (error) return done(error);
        if (response.error) return done(response.error);
        return done(null, response);
      });
    });
  }

  function loadUserParent(profile, done) {
    if (_.contains(earner.types, 'attendee-u13') || _.isEmpty(profile.email)) {
      if (profile && profile.parents && profile.parents.length > 0) {
        seneca.act({
          role: 'cd-profiles',
          cmd: 'list',
          query: { userId: profile.parents[0] },
        }, (err, parentProfiles) => {
          if (err) return done(err);
          const parentProfile = parentProfiles[0];
          return done(null, profile, parentProfile);
        });
      } else {
        if (_.isEmpty(profile.email)) {
          return done(new Error(`Missing email for user ${profile.userId} and no parents found`));
        }
        return done(null, profile, {});
      }
    } else {
      return done(null, profile, {});
    }
  }

  function sendEarnerEmail(profile, parentProfile, done) {
    let recipientEmail;
    const emailCode = 'award-badge-';
    const locality = args.locality || 'en_US';

    if (!_.isEmpty(parentProfile)) {
      recipientEmail = parentProfile.email;
    } else {
      recipientEmail = profile.email;
    }

    const payload = {
      to: recipientEmail,
      code: emailCode,
      locality,
      subject: emailSubject,
      content: {
        recipientName: profile.name,
        badgeName: badge.name,
        badgeLink: badge.url,
        badgeListLink: `${protocol}://${zenHostname}/dashboard/badges`,
        profileLink: `${protocol}://${zenHostname}/profile/${profile.userId}`,
        year: moment(new Date()).format('YYYY'),
      },
    };
    seneca.act({ role: 'cd-dojos', cmd: 'send_email', payload }, done);
  }
}

module.exports = sendBadgeApplication;
