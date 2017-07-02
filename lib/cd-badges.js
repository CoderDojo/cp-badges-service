const listBadges = require('./list-badges');
const getBadge = require('./get-badge');
const deleteBadge = require('./delete-badge');
const updateBadge = require('./update-badge');
const createBadge = require('./create-badge');
const awardBadge = require('./award-badge');
const acceptBadge = require('./accept-badge');
const loadUserBadges = require('./load-user-badges');
const loadBadgeCategories = require('./load-badge-categories');
const loadBadgeByCode = require('./load-badge-by-code');
const claimBadge = require('./claim-badge');
const addBadgeToProfile = require('./add-badge-to-profile');
const exportBadges = require('./export-badges');
const verifyBadge = require('./verify-badge');
const assignRecurrentBadges = require('./assign-recurrent-badges');
//  KPIs
const kpiNumberOfBadgesAwarded = require('./kpi-number-of-badges-awarded');
const kpiNumberOfBadgesPublished = require('./kpi-number-of-badges-published');
//  Perms
const ownBadge = require('./perm/own-badge');

function cdBadges() {
  const seneca = this;
  const plugin = 'cd-badges';
  const options = seneca.export('options');

  seneca.add({ role: plugin, cmd: 'listBadges' }, listBadges({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret, claimCodePrefix: options.claimCodePrefix }));
  seneca.add({ role: plugin, cmd: 'getBadge' }, getBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({ role: plugin, cmd: 'deleteBadge' }, deleteBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({ role: plugin, cmd: 'updateBadge' }, updateBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({ role: plugin, cmd: 'createBadge' }, createBadge({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({ role: plugin, cmd: 'awardBadge' }, awardBadge.bind(seneca));
  // Legacy, used for accepting old badges && to support old code
  // Do not remove until the rest is refactored/ensured not-used anymore
  seneca.add({ role: plugin, cmd: 'sendBadgeApplication' }, awardBadge.bind(seneca));
  seneca.add({ role: plugin, cmd: 'acceptBadge' }, acceptBadge.bind(seneca));

  seneca.add({ role: plugin, cmd: 'loadUserBadges' }, loadUserBadges.bind(seneca));
  seneca.add({ role: plugin, cmd: 'loadBadgeCategories' }, loadBadgeCategories);
  seneca.add({ role: plugin, cmd: 'loadBadgeByCode' }, loadBadgeByCode({ apiBaseUrl: options.apiBaseUrl, apiSecret: options.apiSecret }));
  seneca.add({ role: plugin, cmd: 'claimBadge' }, claimBadge.bind(seneca));
  seneca.add({ role: plugin, cmd: 'addBadgeToProfile' }, addBadgeToProfile.bind(seneca));
  seneca.add({ role: plugin, cmd: 'exportBadges' }, exportBadges.bind(seneca));
  seneca.add({ role: plugin, cmd: 'verifyBadge' }, verifyBadge.bind(seneca));
  seneca.add({ role: plugin, cmd: 'assignRecurrentBadges' }, assignRecurrentBadges.bind(seneca));
  //  KPIs
  seneca.add({ role: plugin, cmd: 'kpiNumberOfBadgesAwarded' }, kpiNumberOfBadgesAwarded.bind(seneca));
  seneca.add({ role: plugin, cmd: 'kpiNumberOfBadgesPublished' }, kpiNumberOfBadgesPublished.bind(seneca));
  //  Perms
  seneca.add({ role: plugin, cmd: 'ownBadge' }, ownBadge.bind(seneca));

  //  System
  seneca.add({ role: plugin, cmd: 'ping' }, require('./ping'));

  return {
    name: plugin,
  };
}

module.exports = cdBadges;
