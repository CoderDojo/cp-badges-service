'use strict';

var request = require('request');
var getToken = require('./utils/get-token');
var _ = require('lodash');

module.exports = function(options) {
  var apiBaseUrl = options.apiBaseUrl;
  var apiSecret = options.apiSecret;
  var requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl
  });
 
  function listBadges(args, callback) {
    var clientRequest = args.clientRequest;
    if(typeof clientRequest === 'undefined'){
      clientRequest = true;
    }
    var claimCodePrefix = options.claimCodePrefix;
    var resource = '/systems/coderdojo/badges';

    var requestOptions = {
        uri: resource,
        method: 'GET',
        headers: {
          'Authorization': 'JWT token="' + getToken(resource, apiSecret) + '"'
        }
    };

    function cb(error, response, body) {
      if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            return callback(e);
        }
      }
      if (!error && response.statusCode === 200) {
        if(clientRequest) {
          //Remove tags containing claimCodePrefix.
          _.each(body.badges, function (badge) {
            var indexFound;
            var containsPrefix = _.find(badge.tags, function (tag, index) {
              indexFound = index;
              return _.contains(tag.value, claimCodePrefix);
            });
            if(containsPrefix) {
              //Remove from badge tags
              badge.tags.splice(indexFound);
            }
          });
        }
        return callback(null, body);
      }
      return callback(error || new Error(body.message));
    }

    requestWithDefaults(requestOptions, cb);
  }

  return listBadges;
};
