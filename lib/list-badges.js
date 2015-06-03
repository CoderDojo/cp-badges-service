'use strict';

var request = require('request');
var jws = require('jws');


function getClaimData(resource, apiSecret) {
    var claimData = {
        header: {
            typ: 'JWT',
            alg: 'HS256'
        },
        payload: {
            key: 'master',
            exp: Date.now() + (1000 * 60),
            method: 'GET',
            path: resource
        },
        secret: apiSecret
    };

    return claimData;
}


module.exports = function(options) {
    var apiBaseUrl = options.apiBaseUrl;
    var apiSecret = options.apiSecret;
    var requestWithDefaults = request.defaults({
        baseUrl: apiBaseUrl
    });

    function listBadges(args, callback) {
        var resource = '/systems/coderdojo/badges';
        var claimData = getClaimData(resource, apiSecret);

        var requestOptions = {
            uri: resource,
            method: 'GET',
            headers: {
                'Authorization': 'JWT token="' + jws.sign(claimData) + '"'
            }
        };

        function cb(error, response) {
            if (error) {
                return callback(error);
            }

            callback(null, response);
        }

        requestWithDefaults(requestOptions, cb);
    }

    return listBadges;
};
