'use strict';

var listBadges = require('./list-badges');
var getBadge = require('./get-badge');
var deleteBadge = require('./delete-badge');
var updateBadge = require('./update-badge');
var createBadge = require('./create-badge');
var awardBadge = require('./award-badge');
var acceptBadge = require('./accept-badge');
var loadUserBadges = require('./load-user-badges');
var loadBadgeCategories = require('./load-badge-categories');
var loadBadgeByCode = require('./load-badge-by-code');
var claimBadge = require('./claim-badge');
var addBadgeToProfile = require('./add-badge-to-profile');
var exportBadges = require('./export-badges');
var verifyBadge = require('./verify-badge');
var assignRecurrentBadges = require('./assign-recurrent-badges');
//  KPIs
var kpiNumberOfBadgesAwarded = require('./kpi-number-of-badges-awarded');
var kpiNumberOfBadgesPublished = require('./kpi-number-of-badges-published');
//  Perms
var ownBadge = require('./perm/own-badge');

module.exports = function () {
  var seneca = this;
  var plugin = 'cd-badges';
  var options = seneca.export('options');

  seneca.add({role: plugin, cmd: 'listBadges'}, listBadges({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret, claimCodePrefix: options.claimCodePrefix }));
  seneca.add({role: plugin, cmd: 'getBadge'}, getBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'deleteBadge'}, deleteBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'updateBadge'}, updateBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'createBadge'}, createBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({role: plugin, cmd: 'awardBadge'}, awardBadge.bind(seneca));
  // Legacy, used for accepting old badges && to support old code
  // Do not remove until the rest is refactored/ensured not-used anymore
  seneca.add({role: plugin, cmd: 'sendBadgeApplication'}, awardBadge.bind(seneca));
  seneca.add({role: plugin, cmd: 'acceptBadge'}, acceptBadge.bind(seneca));

  seneca.add({role: plugin, cmd: 'loadUserBadges'}, loadUserBadges.bind(seneca));
  seneca.add({role: plugin, cmd: 'loadBadgeCategories'}, loadBadgeCategories);
  seneca.add({role: plugin, cmd: 'loadBadgeByCode'}, loadBadgeByCode({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret}));
  seneca.add({role: plugin, cmd: 'claimBadge'}, claimBadge.bind(seneca));
  seneca.add({role: plugin, cmd: 'addBadgeToProfile'}, addBadgeToProfile.bind(seneca));
  seneca.add({role: plugin, cmd: 'exportBadges'}, exportBadges.bind(seneca));
  seneca.add({role: plugin, cmd: 'verifyBadge'}, verifyBadge.bind(seneca));
  seneca.add({role: plugin, cmd: 'assignRecurrentBadges'}, assignRecurrentBadges.bind(seneca));
  //  KPIs
  seneca.add({role: plugin, cmd: 'kpiNumberOfBadgesAwarded'}, kpiNumberOfBadgesAwarded.bind(seneca));
  seneca.add({role: plugin, cmd: 'kpiNumberOfBadgesPublished'}, kpiNumberOfBadgesPublished.bind(seneca));
  //  Perms
  seneca.add({role: plugin, cmd: 'ownBadge'}, ownBadge.bind(seneca));

  //  System
  seneca.add({ role: plugin, cmd: 'ping' }, require('./ping'));

  return {
    name: plugin
  };
};
