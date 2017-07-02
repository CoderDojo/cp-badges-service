const request = require('request');
const getToken = require('./utils/get-token');
const _ = require('lodash');

module.exports = options => {
  const apiBaseUrl = options.apiBaseUrl;
  const apiSecret = options.apiSecret;
  const requestWithDefaults = request.defaults({
    baseUrl: apiBaseUrl,
  });

  function listBadges(args, callback) {
    let clientRequest = args.clientRequest;
    if (typeof clientRequest === 'undefined') {
      clientRequest = true;
    }
    const claimCodePrefix = options.claimCodePrefix;
    const resource = '/systems/coderdojo/badges';
    const requestOptions = {
      uri    : resource,
      method : 'GET',
      headers: {
        Authorization: `JWT token="${getToken(resource, apiSecret)}"`,
      },
    };

    function cb(error, response, body) {
      // TODO: Break this out in to its own file it is ues all calls to badgekit
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body); // eslint-disable-line no-param-reassign
        } catch (e) {
          return callback(e);
        }
      }
      if (!error && response.statusCode === 200) {
        if (clientRequest) {
          // Remove tags containing claimCodePrefix.
          _.each(body.badges, badge => {
            let indexFound;
            const containsPrefix = _.find(badge.tags, (tag, index) => {
              indexFound = index;
              return _.contains(tag.value, claimCodePrefix);
            });
            if (containsPrefix) {
              // Remove from badge tags
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
