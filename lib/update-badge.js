'use strict';

var request = require('request');
var getToken = require('./utils/get-token');
var parseResponse = require('./utils/parse-response');

module.exports = function (options) {
  var apiBaseUrl = options.apiBaseUrl;
  var apiSecret = options.apiSecret;
  var requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl
  });

  function updateBadge (args, callback) {
    var resource = '/systems/coderdojo/badges/' + args.slug;
    var method = 'PUT';
    var token = getToken(resource, apiSecret, method, JSON.stringify(args.badgeInfo));

    var requestOptions = {
      uri: resource,
      method: method,
      headers: {
        'Authorization': 'JWT token="' + token + '"'
      },
      json: args.badgeInfo
    };

    requestWithDefaults(requestOptions, parseResponse.bind(null, 200, callback));
  }

  return updateBadge;
};
