'use strict';

var senecaOptions = {
    transport: {
        web: {
            port: process.env.BADGES_SERVICE_PORT || 10305
        }
    },
    apiBaseUrl: process.env.BADGEKIT_API_BASE_URL || 'http://localhost:8080',
    apiSecret: process.env.BADGEKIT_API_SECRET || '',
    claimCodePrefix: 'code-'
};


module.exports = senecaOptions;
