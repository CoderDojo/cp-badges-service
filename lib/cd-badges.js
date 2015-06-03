'use strict';

var listBadges = require('./list-badges');

module.exports = function() {
    var seneca = this;
    var plugin = 'cd-badges';
    var options = seneca.export('options');

    seneca.add({
        role: plugin,
        cmd: 'list'
    }, listBadges({
        apiBaseUrl: options.apiBaseUrl,
        apiSecret: options.apiSecret
    }));


    return {
        name: plugin
    };
};
