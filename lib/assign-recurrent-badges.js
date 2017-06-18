'use strict';

const async = require('async');
const _ = require('lodash');
const moment = require('moment');

function assignRecurrentBadges (args, callback) {
  const seneca = this;
  const plugin = args.role;
  const application = args.application;
  //  TODO: migration to qualify badges?
  const recurrentBadges = [
    {slug: 'my-1st-dojo!', recurrence: 1, only: ['attendee-u13', 'attendee-o13']},
    {slug      : 'europe-code-week-2016', recurrence: 1, dates     : ['2016-10-15 00:00:00', '2016-10-31 23:59:59'],
      evidence  : 'Participed in Code Week 2016 by attending a CoderDojo event on the ' + moment.utc(args.application.attendance[0]).format('DD/MM/YYYY')},
    {slug: 'attend-5-dojo-sessions!', recurrence: 5, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'attend-10-dojo-sessions!', recurrence: 10, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'attend-25-dojo-sessions!', recurrence: 25, only: ['attendee-u13', 'attendee-o13']},
    {slug: 'mentor-badge', recurrence: 2, only: ['mentor']},
  ];
  const zenHostname = process.env.HOSTNAME || '127.0.0.1:8000';

  async.waterfall([
    getProfile,
    getBadges,
    checkAvailableBadges,
    awardBadges,
  ], (err, res) => {
    if (err) return callback(null, {error: err});
    return callback(null, res);
  });

  function getProfile (done) {
    seneca.act({role: 'cd-dojos', cmd: 'load_usersdojos', query: {userId: application.userId}}, (err, dojoUser) => {
      if (err) return done(err);
      const user = {
        id      : application.userId,
        userType: _.uniq(_.flatten(_.map(dojoUser, 'userTypes'))),
        //  TODO : differenciate badges per dojos ?
      };
      seneca.act({role: 'cd-profiles', cmd: 'load_user_profile', userId: application.userId}, (err, profile) => {
        if (err) return done(err);
        user.badges = profile.badges;
        return done(null, user);
      });
    });
  }

  function getBadges (dojoUser, done) {
    let mozillaRecurrentBadges = [];
    seneca.act({role: plugin, cmd: 'listBadges'}, (err, response) => {
      if (err) return done(err);
      mozillaRecurrentBadges = _.filter(response.badges, (b) => {
        return _.find(recurrentBadges, {slug: b.slug});
      });
      return done(null, dojoUser, mozillaRecurrentBadges);
    });
  }

  function checkAvailableBadges (dojoUser, mozillaBadges, done) {
    let badges = [];
    seneca.act({role: 'cd-events', cmd: 'searchApplications', query: {userId: application.userId, 'attendance': {ne$: '{}'}}},
     (err, applications) => {
       if (err) return done(err);

       badges = _.filter(recurrentBadges, (badge) => {
         let acceptedUserType = true;
         let inDates = true;
         if (badge.only) {
           acceptedUserType = filterUserType(dojoUser.userType, badge.only);
         }
         if (badge.dates) {
           inDates = moment().isBetween(badge.dates[0], badge.dates[1], 'seconds');
         }
         return filterRecurrent(applications.length, badge.recurrence) && acceptedUserType && inDates;
       });
      //  Make the link between our restrictions declaration and the real mozillaBadges
       const awardableBadges = [];
       _.each(badges, (badge) => {
         const mozillaBadge = _.find(mozillaBadges, {slug: badge.slug});
         if (mozillaBadge) {
           mozillaBadge.evidence = badge.evidence;
           awardableBadges.push(mozillaBadge);
         }
       });
      //  Remove the badges he already owns
       const newBadges = _.filter(awardableBadges, (badge) => {
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
      async.eachSeries(badges, (badge, callback) => {
        const applicationData = {
          user        : dojoUser,
          badge       : badge,
          emailSubject: 'You have been awarded a new CoderDojo digital badge!',
        };
        if (badge.evidence) applicationData.evidence = badge.evidence;
        seneca.act({role           : plugin, cmd            : 'sendBadgeApplication',
          applicationData: _.clone(applicationData), user           : {id: null},
          zenHostname    : zenHostname},
        callback);
      },
      (err) => {
        if (err) return done(err);
        return done();
      });
    } else {
      done();
    }
  }
}

module.exports = assignRecurrentBadges;
