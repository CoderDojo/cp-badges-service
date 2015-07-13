'use strict';

var async = require('async');
var moment = require('moment');
var _ = require('lodash');

function acceptBadge(args, callback) {
  var seneca = this;
  var zenHostname = args.zenHostname;
  var badgeData = args.badgeData;
  var user = args.user;
  
  if(badgeData.userId !== user.id) return callback(null, {error: 'Only the nominated user can accept this badge.'});

  seneca.act({role: 'cd-profiles', cmd: 'list_query', query:{userId: badgeData.userId}}, function (err, response) {
    if(err) return callback(err);
    var profile = response[0];

    var badgeFound = _.find(profile.badges, function (userBadge) {
      return userBadge.slug === badgeData.badgeSlug;
    });

    if(!badgeFound) return callback(null, {error:'Badge not found.'});
    if(badgeFound.status === 'accepted') return callback(null, {error: 'This badge has already been accepted.'});

    badgeFound.status = 'accepted';
    badgeFound.dateAccepted = new Date();

    seneca.act({role: 'cd-profiles', cmd: 'save', profile: profile}, callback);
  });

}

module.exports = acceptBadge;
