'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var jws = require('jws');
var startTestApi = require('./utils/test-server');


describe('listBadges', function() {
    var sandbox;
    var clock;
    var jwsSignStub;
    var resource = '/systems/coderdojo/badges';
    var dummyBaseUrl = 'http://localhost:3000';
    var dummyToken = 'dummyToken';
    var dummySecret = 'dummySecret';
    var now = 1433288850689;
    var testApi;
    var listBadges;
    var checkRequestStub;


    before(function(done) {
        testApi = startTestApi(done);
    });

    after(function(done) {
        testApi.server.close(done);
    });

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        clock = sinon.useFakeTimers(now);

        jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);

        checkRequestStub = sandbox.stub(testApi, 'checkRequest');

        listBadges = require('../lib/list-badges')({
            apiBaseUrl: dummyBaseUrl,
            apiSecret: dummySecret
        });
    });


    afterEach(function() {
        clock.restore();
        sandbox.restore();
    });


    describe('request', function() {

        beforeEach(function(done) {
            listBadges(null, done);
        });

        it('makes a GET request to /systems/coderdojo/badges', function() {
            expect(checkRequestStub.args[0][0].method).to.equal('GET');
            expect(checkRequestStub.args[0][0].url).to.equal(resource);
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
                        path: resource
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

            listBadges(null, function(err, res) {
                expect(err).to.exist;
                done();
            });
        });

        it('passes the data to the callback', function(done) {
            testApiTestResponseStub.returns({
                statusCode: 200,
                data: {}
            });

            listBadges(null, function(err, res) {
                expect(err).to.not.exist;
                expect(res).to.exist;
                done();
            });
        });

    });
});
