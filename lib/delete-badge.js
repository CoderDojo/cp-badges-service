'use strict';

var request = require('request');
var getToken = require('./utils/get-token');
var parseResponse = require('./utils/parse-response');


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

        requestWithDefaults(requestOptions, parseResponse.bind(null, 200, callback));
    }

    return deleteBadge;
};
