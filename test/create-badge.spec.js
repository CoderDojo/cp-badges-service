'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var jws = require('jws');
var startTestApi = require('./utils/test-server');
var getSha256Hash = require('../lib/utils/get-sha256-hash');
var lab = exports.lab = require('lab').script();

var testApi;

var badgeInfo = {
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


lab.experiment('create badge', function() {
    var sandbox;
    var clock;
    var now = 0;
    var jwsSignStub;
    var checkRequestStub;
    var testApiTestResponseStub;
    var createBadge;
    var resource = '/systems/coderdojo/badges';
    var dummyBaseUrl = 'http://localhost:3000';
    var dummyToken = 'dummyToken';
    var dummySecret = 'dummySecret';

    lab.before(function(done) {
        testApi = startTestApi(done);
    });

    lab.after(function(done) {
        testApi.server.close(done);
    });


    lab.beforeEach(function(done) {
        sandbox = sinon.sandbox.create();

        jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);
        checkRequestStub = sandbox.stub(testApi, 'checkRequest');
        testApiTestResponseStub = sandbox.stub(testApi, 'getTestResponse')
            .returns({
                statusCode: 201,
                data: [1, 2, 3]
            });

        createBadge = require('../lib/create-badge')({
            apiBaseUrl: dummyBaseUrl,
            apiSecret: dummySecret
        });

        done();
    });


    lab.afterEach(function(done) {
        sandbox.restore();
        done();
    });


    lab.experiment('request', function() {
        lab.beforeEach(function(done) {
            clock = sinon.useFakeTimers(now);
            createBadge({
                badgeInfo: badgeInfo
            }, done);
        });

        lab.afterEach(function(done) {
            clock.restore();
            done();
        });

        lab.test('makes a POST request to /systems/coderdojo/badges', function(done) {
            expect(checkRequestStub.args[0][0].method).to.equal('POST');
            expect(checkRequestStub.args[0][0].url).to.equal(resource);
            done();
        });

        lab.experiment('request header', function() {
            lab.test('sets the Authorization header', function(done) {
                expect(checkRequestStub.args[0][0].headers.authorization)
                    .to.equal('JWT token="' + dummyToken + '"');
                done();
            });

            lab.test('calls jws sign with claimData', function(done) {
                var claimData = {
                    header: {
                        typ: 'JWT',
                        alg: 'HS256'
                    },
                    payload: {
                        key: 'master',
                        exp: Date.now() + (1000 * 60),
                        method: 'POST',
                        path: resource,
                        body: {
                            alg: 'sha256',
                            hash: getSha256Hash(JSON.stringify(badgeInfo))
                        }
                    },
                    secret: dummySecret
                };

                expect(jwsSignStub.args[0][0]).to.deep.equal(claimData);
                done();
            });
        });
    });


    lab.experiment('response', function() {
        lab.test('passes the error to the callback', function(done) {
            testApiTestResponseStub.returns({
                statusCode: 500,
                data: {}
            });

            createBadge({
                    badgeInfo: badgeInfo
                },
                function(err, res) {
                    expect(err).to.exist;
                    done();
                }
            );
        });

        lab.test('passes the data to the callback', function(done) {
            createBadge({
                    badgeInfo: badgeInfo
                },
                function(err, res) {
                    expect(err).to.not.exist;
                    expect(res).to.exist;
                    done();
                }
            );
        });
    });
});
