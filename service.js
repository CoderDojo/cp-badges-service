process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100; // eslint-disable-line no-underscore-dangle

if (process.env.NEW_RELIC_ENABLED === 'true') require('newrelic'); // eslint-disable-line global-require

const options = require('./config/seneca-options');
const seneca = require('seneca')(options);
const log = require('cp-logs-lib')({ name: 'cp-badges-service', level: 'warn' });

options.log = log.log;
const cdBadges = require('./lib/cd-badges');

seneca.options(options);
seneca.log.info('Seneca options', JSON.stringify(options, null, 4));

seneca.use(cdBadges);
seneca.use(require('cp-permissions-plugin'), {
  config: `${__dirname}/config/permissions`,
});

seneca
  .listen()
  .client({
    type: 'web',
    host: process.env.CD_DOJOS || 'localhost',
    port: 10301,
    pin: { role: 'cd-dojos', cmd: '*' },
  })
  .client({
    type: 'web',
    host: process.env.CD_USERS || 'localhost',
    port: 10303,
    pin: { role: 'cd-profiles', cmd: '*' },
  })
  .client({
    type: 'web',
    host: process.env.CD_USERS || 'localhost',
    port: 10303,
    pin: { role: 'cd-users', cmd: '*' },
  })
  .client({
    type: 'web',
    host: process.env.CD_EVENTS || 'localhost',
    port: 10306,
    pin: { role: 'cd-events', cmd: '*' },
  });
