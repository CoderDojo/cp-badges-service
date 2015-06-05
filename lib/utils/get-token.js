'use strict';

var jws = require('jws');

function getClaimData(resource, apiSecret, method) {
    var claimData = {
        header: {
            typ: 'JWT',
            alg: 'HS256'
        },
        payload: {
            key: 'master',
            exp: Date.now() + (1000 * 60),
            method: method,
            path: resource
        },
        secret: apiSecret
    };

    return claimData;
}

module.exports = function getToken(resource, apiSecret, method) {
    method = method || 'GET';

    var claimData = getClaimData(resource, apiSecret, method);
    return jws.sign(claimData);
};
