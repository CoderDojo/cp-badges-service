'use strict';

if (process.env.NEW_RELIC_ENABLED === "true") require('newrelic');

var seneca = require('seneca')();
var options = require('./config/seneca-options');
var cdBadges = require('./lib/cd-badges');

seneca.options(options);
seneca.log.info(
  'Seneca options',
  JSON.stringify(options, null, 4)
);

seneca.use(cdBadges);
seneca.listen()
  .client({type: 'web', host: process.env.DOCKER_HOST_IP || process.env.TARGETIP || '127.0.0.1', port: 10301, pin: 'role:cd-dojos,cmd:*'})
  .client({type: 'web', host: process.env.DOCKER_HOST_IP || process.env.TARGETIP || '127.0.0.1', port: 10303, pin: 'role:cd-profiles,cmd:*'});
