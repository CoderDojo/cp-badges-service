'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var jws = require('jws');
var startTestApi = require('./utils/test-server');
var lab = exports.lab = require('lab').script();

var testApi;

var dummyBadge = {
    slug: 'slug'
};


lab.experiment('delete badge', function() {
    var sandbox;
    var clock;
    var now = 0;
    var jwsSignStub;
    var checkRequestStub;
    var deleteBadge;
    var resource = '/systems/coderdojo/badges/';
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

        deleteBadge = require('../lib/delete-badge')({
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
            deleteBadge({
                slug: dummyBadge.slug
            }, done);
        });

        lab.afterEach(function(done) {
            clock.restore();
            done();
        });

        lab.test('makes a DELETE request to /systems/coderdojo/badges/slug', function(done) {
            expect(checkRequestStub.args[0][0].method).to.equal('DELETE');
            expect(checkRequestStub.args[0][0].url).to.equal(resource + dummyBadge.slug);
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
                        method: 'DELETE',
                        path: resource + dummyBadge.slug
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

            deleteBadge({
                slug: dummyBadge.slug
            }, function(err, res) {
                expect(err).to.exist;
                done();
            });
        });

        lab.test('passes the data to the callback', function(done) {
            var error = null;
            var data = {
                result: [1, 2, 3]
            };

            testApiTestResponseStub.returns({
                statusCode: 200,
                data: data
            });

            deleteBadge({
                slug: dummyBadge.slug
            }, function(err, res) {
                expect(err).to.not.exist;
                expect(res).to.exist;
                done();
            });
        });
    });
});
