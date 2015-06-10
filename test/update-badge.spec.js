'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var jws = require('jws');
var startTestApi = require('./utils/test-server');
var getSha256Hash = require('../lib/utils/get-sha256-hash');


var testApi;

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


describe('update badge', function() {

    var sandbox;
    var clock;
    var now = 0;
    var jwsSignStub;
    var checkRequestStub;
    var updateBadge;
    var resource = '/systems/coderdojo/badges/';
    var dummyBaseUrl = 'http://localhost:3000';
    var dummyToken = 'dummyToken';
    var dummySecret = 'dummySecret';

    before(function(done) {
        testApi = startTestApi(done);
    });

    after(function(done) {
        testApi.server.close(done);
    });


    beforeEach(function() {
        sandbox = sinon.sandbox.create();

        jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);
        checkRequestStub = sandbox.stub(testApi, 'checkRequest');

        updateBadge = require('../lib/update-badge')({
            apiBaseUrl: dummyBaseUrl,
            apiSecret: dummySecret
        });
    });


    afterEach(function() {
        sandbox.restore();
    });


    describe('request', function() {
        beforeEach(function(done) {
            clock = sinon.useFakeTimers(now);
            updateBadge({
                slug: 'slug',
                badgeInfo: badgeInfo
            }, done);
        });

        afterEach(function() {
            clock.restore();
        });

        it('makes a PUT request to /systems/coderdojo/badges/slug', function() {
            expect(checkRequestStub.args[0][0].method).to.equal('PUT');
            expect(checkRequestStub.args[0][0].url).to.equal(resource + badgeInfo.slug);
        });

        describe('request header', function() {
            it('sets the Authorization header', function() {
                expect(checkRequestStub.args[0][0].headers.authorization)
                    .to.equal('JWT token="' + dummyToken + '"');
            });

            it('calls jws sign with claimData', function() {
                var claimData = {
                    header: {
                        typ: 'JWT',
                        alg: 'HS256'
                    },
                    payload: {
                        key: 'master',
                        exp: Date.now() + (1000 * 60),
                        method: 'PUT',
                        path: resource + badgeInfo.slug,
                        body: {
                            alg: 'sha256',
                            hash: getSha256Hash(JSON.stringify(badgeInfo))
                        }
                    },
                    secret: dummySecret
                };

                expect(jwsSignStub.args[0][0]).to.deep.equal(claimData);
            });
        });
    });


    describe('response', function() {
        var testApiTestResponseStub;

        beforeEach(function() {
            testApiTestResponseStub = sandbox.stub(testApi, 'getTestResponse');
        });

        it('passes the error to the callback', function(done) {
            testApiTestResponseStub.returns({
                statusCode: 500,
                data: {}
            });

            updateBadge({
                    slug: 'slug',
                    badge: badgeInfo
                },
                function(err, res) {
                    expect(err).to.exist;
                    done();
                }
            );
        });

        it('passes the data to the callback', function(done) {
            var error = null;
            var data = {
                result: [1, 2, 3]
            };

            testApiTestResponseStub.returns({
                statusCode: 200,
                data: data
            });

            updateBadge({
                    slug: 'slug',
                    badge: badgeInfo
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
