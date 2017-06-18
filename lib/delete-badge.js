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

  function deleteBadge (args, callback) {
    const resource = '/systems/coderdojo/badges/' + args.slug;
    const method = 'DELETE';

    const requestOptions = {
      uri    : resource,
      method : method,
      headers: {
        'Authorization': 'JWT token="' + getToken(resource, apiSecret, method) + '"',
      },
    };

    requestWithDefaults(requestOptions, parseResponse.bind(null, 200, callback));
  }

  return deleteBadge;
};
