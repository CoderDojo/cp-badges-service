'use strict';

var crypto = require('crypto');

function getSha256Hash(data) {
    var computedHash = crypto.createHash('sha256').update(data).digest('hex');

    return computedHash;
}

module.exports = getSha256Hash;
