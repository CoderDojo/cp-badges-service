'use strict';

const request = require('request');
const getToken = require('./utils/get-token');
const parseResponse = require('./utils/parse-response');

module.exports = function (options) {
  const apiBaseUrl = options.apiBaseUrl;
  const apiSecret = options.apiSecret;
  const requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl,
  });

  function getBadge (args, callback) {
    const resource = '/systems/coderdojo/badges/' + args.slug;

    const requestOptions = {
      uri    : resource,
      method : 'GET',
      headers: {
        'Authorization': 'JWT token="' + getToken(resource, apiSecret) + '"',
      },
    };

    requestWithDefaults(requestOptions, parseResponse.bind(null, 200, callback));
  }

  return getBadge;
};
