'use strict';

var seneca = require('seneca')();
var options = require('./config/seneca-options');
var cdBadges = require('./lib/cd-badges');


seneca.options(options);
seneca.log.info(
    'Seneca options',
    JSON.stringify(seneca.export('options'), null, 4)
);


seneca.use(cdBadges);


seneca.listen();
