'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var http = require('http');
var jws = require('jws');
var startTestApi = require('./utils/test-server');


var testApi;
var testApiResponse = {};
var testApiStatusCode;
var testApiStatusCode;

var dummyBadge = {
    slug: 'slug'
};


describe('get badge', function() {
    var sandbox;
    var clock;
    var now = 0;
    var jwsSignStub;
    var checkRequestStub;
    var getBadge;
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

        getBadge = require('../lib/get-badge')({
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
            getBadge({
                slug: dummyBadge.slug
            }, done);
        });

        afterEach(function() {
            clock.restore();
        });

        it('makes a GET request to /systems/coderdojo/badges/slug', function() {
            expect(checkRequestStub.args[0][0].method).to.equal('GET');
            expect(checkRequestStub.args[0][0].url).to.equal(resource + dummyBadge.slug);
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
                        method: 'GET',
                        path: resource + dummyBadge.slug
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

            getBadge({
                slug: dummyBadge.slug
            }, function(err, res) {
                expect(err).to.exist;
                done();
            });
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

            getBadge({
                slug: dummyBadge.slug
            }, function(err, res) {
                expect(err).to.not.exist;
                expect(res).to.exist;
                done();
            });
        });
    });
});
