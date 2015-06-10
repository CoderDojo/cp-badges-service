'use strict';

var request = require('request');
var getToken = require('./utils/get-token');


module.exports = function(options) {
    var apiBaseUrl = options.apiBaseUrl;
    var apiSecret = options.apiSecret;
    var requestWithDefaults = request.defaults({
        baseUrl: apiBaseUrl
    });

    function updateBadge(args, callback) {

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

        function cb(error, response, body) {
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }
            if (!error && response.statusCode === 200) {
              return callback(null, body);
            }
            return callback(error || new Error(body.message));
        }

        requestWithDefaults(requestOptions, cb);
    }

    return updateBadge;
};
