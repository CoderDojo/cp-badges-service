'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var jws = require('jws');


describe('listBadges', function() {
    var sandbox;
    var clock;
    var requestDefaultsStub;
    var requestWithDefaultsStub;
    var jwsSignStub;
    var resource = '/systems/coderdojo/badges';
    var dummyBaseUrl = 'http://someurl.com';
    var dummyToken = 'dummyToken';
    var dummySecret = 'dummySecret';
    var now = 1433288850689;
    var onListBadgesStub;


    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        clock = sinon.useFakeTimers(now);

        onListBadgesStub = sandbox.stub();
        requestWithDefaultsStub = sandbox.stub();
        requestDefaultsStub = sandbox.stub(request, 'defaults').returns(requestWithDefaultsStub);
        jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);

        var listBadges = require('../lib/list-badges')({
            apiBaseUrl: dummyBaseUrl,
            apiSecret: dummySecret
        });

        listBadges(null, onListBadgesStub);
    });


    afterEach(function() {
        clock.restore();
        sandbox.restore();
    });


    describe('request defaults settings', function() {
        it('sets the baseUrl', function() {
            expect(requestDefaultsStub.args[0][0].baseUrl).to.equal(dummyBaseUrl);
        });
    });


    describe('request', function() {
        it('sets the resource as uri value', function() {
            expect(requestWithDefaultsStub.args[0][0].uri).to.equal(resource);
        });

        it('sets the method to GET', function() {
            expect(requestWithDefaultsStub.args[0][0].method).to.equal('GET');
        });

        describe('request header', function() {
            it('sets the Authorization header', function() {
                expect(requestWithDefaultsStub.args[0][0].headers.Authorization)
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
        it('passes the error to the callback', function() {
            var error = new Error();

            var callback = requestWithDefaultsStub.args[0][1];
            callback(error);

            expect(onListBadgesStub.args[0][0]).to.equal(error);
        });

        it('passes the data to the callback', function() {
            var error = null;
            var data = {
                result: [1, 2, 3]
            };

            var callback = requestWithDefaultsStub.args[0][1];
            callback(error, data);

            expect(onListBadgesStub.args[0][0]).to.equal(error);
            expect(onListBadgesStub.args[0][1]).to.equal(data);
        });
    });
});
