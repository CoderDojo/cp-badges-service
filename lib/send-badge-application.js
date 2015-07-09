'use strict';

var request = require('request');
var getToken = require('./utils/get-token');
var parseResponse = require('./utils/parse-response');
var async = require('async');
var moment = require('moment');

function sendBadgeApplication(args, callback) {
  var seneca = this;
  var options = seneca.export('options');
  var apiBaseUrl = options.apiBaseUrl;
  var apiSecret = options.apiSecret;
  var zenHostname = args.zenHostname;
  var requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl
  });

  var applicationData = args.applicationData;
  var badge = applicationData.badge;
  var earner = applicationData.user;
 
  async.waterfall([
    createBadgeInstance,
    saveBadgeToUserProfile,
    sendEarnerEmail
  ], function (err, res) {
    if(err) return callback(null, {error: err.message});
    return callback(null, res);
  });

  function createBadgeInstance(done) {
    var resource = '/systems/coderdojo/badges/' + badge.slug + '/instances';
    var method = 'POST';
    var application = {
      email: earner.email
    };
    var token = getToken(resource, apiSecret, method, JSON.stringify(application));
    var requestOptions = {
        uri: resource,
        method: method,
        headers: {
            'Authorization': 'JWT token="' + token + '"'
        },
        json: application
    };

    requestWithDefaults(requestOptions, parseResponse.bind(null, 201, done));
  }

  function saveBadgeToUserProfile(badgeInstance, done) {
    var badgeData = {
      status: 'pending',
      instance: badgeInstance,
      badge: badge
    };
    //Use list_query command instead because cmd_list has security checks and adds unnecessary fields.
    seneca.act({role: 'cd-profiles', cmd: 'list_query', query:{userId: earner.id}}, function (err, response) {
      if(err) return done(err);
      var profile = response[0];
      if(!profile.badges) profile.badges = [];
      profile.badges.push(badgeData);
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
        link: 'http://' + zenHostname + '/dashboard/badges/verify/' + earner.id + '/' + badge.slug,
        year: moment(new Date()).format('YYYY')
      }
    };
    seneca.act({role:'cd-dojos', cmd:'send_email', payload:payload}, done);
  }

}

module.exports = sendBadgeApplication;

