'use strict';

var util = require('util');
var seneca = require('seneca')();
var options = require('../config/seneca-options');


seneca.options(options);

seneca.log.info(
    'Seneca options',
    JSON.stringify(seneca.export('options'), null, 4)
);


seneca.client();


function callback(err, result) {
    if (err) {
        return console.error(err);
    }

    var msg = util.inspect(result, true, null, true);
    console.log(msg);
}


seneca.act({
    role: 'cd-badges',
    cmd: 'delete-badge',
    slug: 'slug'
}, callback);
