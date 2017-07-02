const request = require('request');
const getToken = require('./utils/get-token');

module.exports = options => {
  const apiBaseUrl = options.apiBaseUrl;
  const apiSecret = options.apiSecret;
  const requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl,
  });

  function loadBadgeByCode(args, callback) {
    const code = args.code;
    let clientRequest = args.clientRequest;
    if (typeof clientRequest === 'undefined') {
      clientRequest = true;
    }
    const resource = `/systems/coderdojo/codes/${code}`;
    const requestOptions = {
      uri    : resource,
      method : 'GET',
      headers: {
        Authorization: `JWT token="${getToken(resource, apiSecret)}"`,
      },
    };

    function cb(error, response, body) {
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body); // eslint-disable-line no-param-reassign
        } catch (e) {
          return callback(e);
        }
      }
      if (!error && response.statusCode === 200) {
        return callback(null, body);
      }
      return callback(error || new Error(body.message));
    }
    requestWithDefaults(requestOptions, cb);
  }
  return loadBadgeByCode;
};
