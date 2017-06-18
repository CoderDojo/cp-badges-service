'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const jws = require('jws');
const startTestApi = require('./utils/test-server');
const lab = exports.lab = require('lab').script();

lab.experiment('listBadges', () => {
  let sandbox;
  let clock;
  let jwsSignStub;
  const resource = '/systems/coderdojo/badges';
  const dummyBaseUrl = 'http://localhost:3000';
  const dummyToken = 'dummyToken';
  const dummySecret = 'dummySecret';
  const now = 1433288850689;
  let testApi;
  let listBadges;
  let checkRequestStub;


  lab.before((done) => {
    testApi = startTestApi(done);
  });

  lab.after((done) => {
    testApi.server.close(done);
  });

  lab.beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    clock = sinon.useFakeTimers(now);

    jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);

    checkRequestStub = sandbox.stub(testApi, 'checkRequest');

    listBadges = require('../lib/list-badges')({
      apiBaseUrl: dummyBaseUrl,
      apiSecret : dummySecret,
    });
    done();
  });


  lab.afterEach((done) => {
    clock.restore();
    sandbox.restore();
    done();
  });


  lab.experiment('request', () => {

    lab.beforeEach((done) => {
      listBadges({}, done);
    });

    lab.test('makes a GET request to /systems/coderdojo/badges', (done) => {
      expect(checkRequestStub.args[0][0].method).to.equal('GET');
      expect(checkRequestStub.args[0][0].url).to.equal(resource);
      done();
    });


    lab.experiment('request header', () => {
      lab.test('sets the Authorization header', (done) => {
        expect(checkRequestStub.args[0][0].headers.authorization)
                    .to.equal('JWT token="' + dummyToken + '"');
        done();
      });

      lab.test('calls jws sign with claimData', (done) => {
        const claimData = {
          header: {
            typ: 'JWT',
            alg: 'HS256',
          },
          payload: {
            key   : 'master',
            exp   : Date.now() + (1000 * 60),
            method: 'GET',
            path  : resource,
          },
          secret: dummySecret,
        };

        expect(jwsSignStub.args[0][0]).to.deep.equal(claimData);
        done();
      });
    });
  });


  lab.experiment('response', () => {

    let testApiTestResponseStub;

    lab.beforeEach((done) => {
      testApiTestResponseStub = sandbox.stub(testApi, 'getTestResponse');
      done();
    });

    lab.test('passes the error to the callback', (done) => {
      testApiTestResponseStub.returns({
        statusCode: 500,
        data      : {},
      });

      listBadges({}, (err) => {
        expect(err).to.exist;
        done();
      });
    });

    lab.test('passes the data to the callback', (done) => {
      testApiTestResponseStub.returns({
        statusCode: 200,
        data      : {},
      });

      listBadges({}, (err, res) => {
        expect(err).to.not.exist;
        expect(res).to.exist;
        done();
      });
    });

  });
});
