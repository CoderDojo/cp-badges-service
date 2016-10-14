'use strict';

var async = require('async');
var _ = require('lodash');
var moment = require('moment');

function assignRecurrentBadges (args, callback) {
  var seneca = this;
  //  TODO: migration to qualify badges?
  var recurrentBadges = [
    {slug: 'my-1st-dojo!', recurrence: 1, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'europe-code-week-2016', recurrence: 1, dates: ['2016-10-15 00:00:00', '2016-10-23 24:59:59']},
    {slug: 'attend-5-dojo-sessions!', recurrence: 5, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'attend-10-dojo-sessions!', recurrence: 10, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'attend-25-dojo-sessions!', recurrence: 25, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'mentor-badge', recurrence: 2, only: ['mentor']}
  ];
  var plugin = args.role;
  var application = args.application;
  var zenHostname = process.env.HOSTNAME || '127.0.0.1:8000';

  async.waterfall([
    getProfile,
    getBadges,
    checkAvailableBadges,
    awardBadges
  ], function (err, res) {
    if (err) return callback(null, {error: err});
    return callback(null, res);
  });

  function getProfile (done) {
    seneca.act({role: 'cd-dojos', cmd: 'load_usersdojos', query: {userId: application.userId}}, function (err, dojoUser) {
      if (err) return done(err);
      var user = {
        id: application.userId,
        userType: _.uniq(_.flatten(_.map(dojoUser, 'userTypes')))
        //  TODO : differenciate badges per dojos ?
      };
      seneca.act({role: 'cd-profiles', cmd: 'load_user_profile', userId: application.userId}, function (err, profile) {
        if (err) return done(err);
        user.badges = profile.badges;
        return done(null, user);
      });
    });
  }

  function getBadges (dojoUser, done) {
    var mozillaRecurrentBadges = [];
    seneca.act({role: plugin, cmd: 'listBadges'}, function (err, response) {
      if (err) return done(err);
      mozillaRecurrentBadges = _.filter(response.badges, function (b) {
        return _.find(recurrentBadges, {slug: b.slug});
      });
      return done(null, dojoUser, mozillaRecurrentBadges);
    });
  }

  function checkAvailableBadges (dojoUser, mozillaBadges, done) {
    var badges = [];
    seneca.act({role: 'cd-events', cmd: 'searchApplications', query: {userId: application.userId, 'attendance': {ne$: '{}'}}},
     function (err, applications) {
      if (err) return done(err);

      badges = _.filter(recurrentBadges, function (badge) {
        var acceptedUserType = true;
        var inDates = true;
        if (badge.only) {
          acceptedUserType = filterUserType(dojoUser.userType, badge.only);
        }
        if (badge.dates) {
          inDates = moment().isBetween(badge.dates[0], badge.dates[1], 'seconds');
        }
        return filterRecurrent(applications.length, badge.recurrence) && acceptedUserType && inDates;
      });
      //  Make the link between our restrictions declaration and the real mozillaBadges
      var awardableBadges = [];
      _.each(badges, function (badge) {
        var mozillaBadge = _.find(mozillaBadges, {slug: badge.slug});
        if (mozillaBadge) {
          awardableBadges.push(mozillaBadge);
        }
      });
      //  Remove the badges he already owns
      var newBadges = _.filter(awardableBadges, function (badge) {
        return !_.find(dojoUser.badges, { 'id': badge.id });
      });

      return done(null, dojoUser, newBadges);
    });

    function filterRecurrent (value, reference) {
      return value >= reference;
    }
    function filterUserType (value, references) {
      return _.intersection(references, value).length > 0;
    }
  }

  function awardBadges (dojoUser, badges, done) {
    if (badges.length > 0) {
      async.eachSeries(badges, function (badge, callback) {
        var applicationData = {
          user: dojoUser,
          badge: badge,
          emailSubject: 'You have been awarded a new CoderDojo digital badge!'
        };
        seneca.act({role: plugin, cmd: 'sendBadgeApplication',
          applicationData: _.clone(applicationData), user: {id: null},
          zenHostname: zenHostname},
        callback);
      },
      function (err) {
        if (err) return done(err);
        return done();
      });
    } else {
      done();
    }
  }
}

module.exports = assignRecurrentBadges;
