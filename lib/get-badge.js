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

    function getBadge(args, callback) {
        var resource = '/systems/coderdojo/badges/' + args.slug;

        var requestOptions = {
            uri: resource,
            method: 'GET',
            headers: {
                'Authorization': 'JWT token="' + getToken(resource, apiSecret) + '"'
            }
        };

        requestWithDefaults(requestOptions, parseResponse.bind(null, 200, callback));
    }

    return getBadge;
};
