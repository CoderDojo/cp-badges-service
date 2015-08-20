'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var jws = require('jws');
var startTestApi = require('./utils/test-server');
var lab = exports.lab = require('lab').script();

lab.experiment('listBadges', function() {
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


    lab.before(function(done) {
        testApi = startTestApi(done);
    });

    lab.after(function(done) {
        testApi.server.close(done);
    });

    lab.beforeEach(function(done) {
        sandbox = sinon.sandbox.create();
        clock = sinon.useFakeTimers(now);

        jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);

        checkRequestStub = sandbox.stub(testApi, 'checkRequest');

        listBadges = require('../lib/list-badges')({
            apiBaseUrl: dummyBaseUrl,
            apiSecret: dummySecret
        });
    
        done();
    });


    lab.afterEach(function(done) {
        clock.restore();
        sandbox.restore();
        done();
    });


    lab.experiment('request', function() {

        lab.beforeEach(function(done) {
            listBadges({}, done);
        });

        lab.test('makes a GET request to /systems/coderdojo/badges', function(done) {
            expect(checkRequestStub.args[0][0].method).to.equal('GET');
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
                        method: 'GET',
                        path: resource
                    },
                    secret: dummySecret
                };

                expect(jwsSignStub.args[0][0]).to.deep.equal(claimData);
                done();
            });
        });
    });


    lab.experiment('response', function() {

        var testApiTestResponseStub;

        lab.beforeEach(function(done) {
            testApiTestResponseStub = sandbox.stub(testApi, 'getTestResponse');
            done();
        });

        lab.test('passes the error to the callback', function(done) {
            testApiTestResponseStub.returns({
                statusCode: 500,
                data: {}
            });

            listBadges({}, function(err, res) {
                expect(err).to.exist;
                done();
            });
        });

        lab.test('passes the data to the callback', function(done) {
            testApiTestResponseStub.returns({
                statusCode: 200,
                data: {}
            });

            listBadges({}, function(err, res) {
                expect(err).to.not.exist;
                expect(res).to.exist;
                done();
            });
        });

    });
});
