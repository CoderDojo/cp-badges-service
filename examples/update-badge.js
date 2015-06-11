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


var badgeInfo = {
    slug: 'slug',
    name: 'name',
    imageUrl: 'http://issuersite.com/badge.png',
    unique: false,
    criteriaUrl: 'http://issuersite.com/criteria',
    earnerDescription: 'description for potential earners',
    consumerDescription: 'description for consumers',
    strapline: 'strapline',
    issuerUrl: 'http://issuersite.com',
    rubricUrl: 'http://issuersite.com/rubric',
    timeValue: 10,
    timeUnits: 'minutes',
    evidenceType: 'URL',
    limit: 5,
    archived: false,
    criteria: [{
        id: 1,
        description: 'criteria description',
        required: 1,
        note: 'note for assessor'
    }],
    type: 'badge type',
    categories: [],
    tags: [],
    milestones: []
};


seneca.act({
        role: 'cd-badges',
        cmd: 'updateBadge',
        slug: 'slug',
        badgeInfo: badgeInfo
    },
    callback
);
