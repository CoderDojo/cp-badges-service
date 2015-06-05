'use strict';

var request = require('request');
var getToken = require('./utils/get-token');


module.exports = function(options) {
    var apiBaseUrl = options.apiBaseUrl;
    var apiSecret = options.apiSecret;
    var requestWithDefaults = request.defaults({
        baseUrl: apiBaseUrl
    });

    function deleteBadge(args, callback) {
        var resource = '/systems/coderdojo/badges/' + args.slug;
        var method = 'DELETE';

        var requestOptions = {
            uri: resource,
            method: method,
            headers: {
                'Authorization': 'JWT token="' + getToken(resource, apiSecret, method) + '"'
            }
        };

        function cb(error, response, body) {
            if (!error && response.statusCode === 200) {
                return callback(null, response);
            }
            return callback(error || new Error(body));
        }

        requestWithDefaults(requestOptions, cb);
    }

    return deleteBadge;
};
