'use strict';

var request = require('request');
var getToken = require('./utils/get-token');


module.exports = function(options) {
    var apiBaseUrl = options.apiBaseUrl;
    var apiSecret = options.apiSecret;
    var requestWithDefaults = request.defaults({
        baseUrl: apiBaseUrl
    });

    function listBadges(args, callback) {
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
                return callback(null, body);
            }
            return callback(error || new Error(body.message));
        }

        requestWithDefaults(requestOptions, cb);
    }

    return listBadges;
};
