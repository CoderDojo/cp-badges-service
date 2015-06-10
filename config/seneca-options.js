'use strict';

var senecaOptions = {
    transport: {
        web: {
            port: process.env.BADGES_SERVICE_PORT || 10305
        }
    },
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
    apiSecret: process.env.API_SECRET || ''
};


module.exports = senecaOptions;
