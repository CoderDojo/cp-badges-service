'use strict';

if (process.env.NEW_RELIC_ENABLED === 'true') require('newrelic');

var options = require('./config/seneca-options');
var seneca = require('seneca')(options);
var cdBadges = require('./lib/cd-badges');

seneca.options(options);
seneca.log.info(
  'Seneca options',
  JSON.stringify(options, null, 4)
);

seneca.use(cdBadges);
seneca.use(require('cp-permissions'), {
  config: __dirname + '/config/permissions'
});
seneca.listen()
  .client({type: 'web', port: 10301, pin: 'role:cd-dojos,cmd:*'})
  .client({type: 'web', port: 10303, pin: 'role:cd-profiles,cmd:*'})
  .client({type: 'web', port: 10303, pin: {role: 'cd-users', cmd: '*'}})
  .client({type: 'web', port: 10306, pin: {role: 'cd-events', cmd: '*'}});
