'use strict';

var listBadges = require('./list-badges');
var getBadge = require('./get-badge');
var deleteBadge = require('./delete-badge');
var updateBadge = require('./update-badge');
var createBadge = require('./create-badge');
var sendBadgeApplication = require('./send-badge-application');

module.exports = function() {
  var seneca = this;
  var plugin = 'cd-badges';
  var options = seneca.export('options');
  
  seneca.add({role: plugin, cmd: 'listBadges'}, listBadges({ apiBaseUrl: options.apiBaseUrl,apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'getBadge'}, getBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'deleteBadge' }, deleteBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'updateBadge' }, updateBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'createBadge' }, createBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'sendBadgeApplication' }, sendBadgeApplication.bind(seneca));

  return {
    name: plugin
  };
};
