'use strict';

var listBadges = require('./list-badges');
var getBadge = require('./get-badge');

module.exports = function() {
    var seneca = this;
    var plugin = 'cd-badges';
    var options = seneca.export('options');

    seneca.add({
        role: plugin,
        cmd: 'list-badges'
    }, listBadges({
        apiBaseUrl: options.apiBaseUrl,
        apiSecret: options.apiSecret
    }));

    seneca.add({
        role: plugin,
        cmd: 'get-badge'
    }, getBadge({
        apiBaseUrl: options.apiBaseUrl,
        apiSecret: options.apiSecret
    }));

    return {
        name: plugin
    };
};
