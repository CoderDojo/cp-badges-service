'use strict';

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

module.exports = function getToken(resource, apiSecret) {
    var claimData = getClaimData(resource, apiSecret);
    return jws.sign(claimData);
};
