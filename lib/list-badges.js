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

        function cb(error, response) {
            if (!error && response.statusCode === 200) {
              return callback(null, response);
            }
            return callback(error || new Error());
        }

        requestWithDefaults(requestOptions, cb);
    }

    return listBadges;
};
