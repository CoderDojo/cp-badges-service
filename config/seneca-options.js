'use strict';

var senecaOptions = {
    transport: {
        web: {
            port: process.env.PORT || 8080
        }
    },
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    apiSecret: process.env.API_SECRET || ''
};


module.exports = senecaOptions;
