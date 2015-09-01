'use strict';
var assert = require('assert');
var LogEntries = require('le_node');

function log () {
  // seneca custom log handlers

  if (process.env.LOGENTRIES_ENABLED === 'true') {
    assert.ok(process.env.LOGENTRIES_DEBUG_TOKEN, 'No LOGENTRIES_DEBUG_TOKEN set');
    var led = new LogEntries({
      token: process.env.LOGENTRIES_DEBUG_TOKEN,
      flatten: true,
      flattenArrays: true
    });
    
    assert.ok(process.env.LOGENTRIES_ERRORS_TOKEN, 'No LOGENTRIES_ERROR_TOKEN set');
    var lee = new LogEntries({
      token: process.env.LOGENTRIES_ERRORS_TOKEN,
      flatten: true,
      flattenArrays: true
    });
  }

  function debugHandler() {
    if (process.env.LOGENTRIES_ENABLED === 'true') {
      assert.ok(process.env.LOGENTRIES_DEBUG_TOKEN, 'No LOGENTRIES_DEBUG_TOKEN set');
      led.log('debug', arguments);
    }
  }

  function errorHandler() {
    console.error(JSON.stringify(arguments));

    if (process.env.LOGENTRIES_ENABLED === 'true') {
      assert.ok(process.env.LOGENTRIES_ERRORS_TOKEN, 'No LOGENTRIES_ERROR_TOKEN set');
      lee.log('err', arguments);
    }
  }

  return {
    map:[{
      level:'debug', handler: debugHandler
    }, {
      level:'error', handler: errorHandler
    }]
  };
};

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
  strict: {add:false,  result:false},
  log: log()
};


module.exports = senecaOptions;
