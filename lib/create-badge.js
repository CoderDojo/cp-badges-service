const request = require('request');
const getToken = require('./utils/get-token');
const parseResponse = require('./utils/parse-response');

module.exports = options => {
  const apiBaseUrl = options.apiBaseUrl;
  const apiSecret = options.apiSecret;
  const requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl,
  });

  function createBadge(args, callback) {
    const resource = '/systems/coderdojo/badges';
    const method = 'POST';
    const token = getToken(resource, apiSecret, method, JSON.stringify(args.badgeInfo));

    const requestOptions = {
      uri    : resource,
      method,
      headers: {
        Authorization: `JWT token="${token}"`,
      },
      json: args.badgeInfo,
    };

    requestWithDefaults(requestOptions, parseResponse.bind(null, 201, callback));
  }

  return createBadge;
};
