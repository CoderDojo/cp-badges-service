'use strict';
var assert = require('assert');
var LogEntries = require('le_node');

var senecaOptions = {
  transport: {
    type: 'web',
    web: {
      timeout: 120000,
      port: 10305
    }
  },
  apiBaseUrl: process.env.BADGEKIT_API_BASE_URL || 'http://localhost:8080',
  apiSecret: process.env.BADGEKIT_API_SECRET || '',
  claimCodePrefix: 'code-',
  timeout: 120000,
  strict: { add: false, result: false },
  actcache: { active:false }
};

module.exports = senecaOptions;
