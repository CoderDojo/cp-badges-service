exports.lab = require('lab').script();

const lab = exports.lab;
const { expect } = require('chai');
const sinon = require('sinon');
const jws = require('jws');
const startTestApi = require('./utils/test-server');

const resource = '/systems/coderdojo/badges/';
const dummyBaseUrl = 'http://localhost:3000';
const dummyToken = 'dummyToken';
const dummySecret = 'dummySecret';

const deleteBadge = require('../lib/delete-badge')({
  apiBaseUrl: dummyBaseUrl,
  apiSecret: dummySecret,
});

let testApi;
const seconds = sec => sec * 1000;
const dummyBadge = {
  slug: 'slug',
};

lab.experiment('delete badge', () => {
  let sandbox;
  let clock;
  const now = 0;
  let jwsSignStub;
  let checkRequestStub;
  lab.before((done) => {
    testApi = startTestApi(done);
  });

  lab.after((done) => {
    testApi.server.close(done);
  });

  lab.beforeEach((done) => {
    sandbox = sinon.sandbox.create();

    jwsSignStub = sandbox.stub(jws, 'sign').returns(dummyToken);
    checkRequestStub = sandbox.stub(testApi, 'checkRequest');

    done();
  });

  lab.afterEach((done) => {
    sandbox.restore();
    done();
  });

  lab.experiment('request', () => {
    lab.beforeEach((done) => {
      clock = sinon.useFakeTimers(now);
      deleteBadge(
        {
          slug: dummyBadge.slug,
        },
        done,
      );
    });

    lab.afterEach((done) => {
      clock.restore();
      done();
    });

    lab.test('makes a DELETE request to /systems/coderdojo/badges/slug', (done) => {
      expect(checkRequestStub.args[0][0].method).to.equal('DELETE');
      expect(checkRequestStub.args[0][0].url).to.equal(resource + dummyBadge.slug);
      done();
    });

    lab.experiment('request header', () => {
      lab.test('sets the Authorization header', (done) => {
        expect(checkRequestStub.args[0][0].headers.authorization).to.equal(
          `JWT token="${dummyToken}"`,
        );
        done();
      });

      lab.test('calls jws sign with claimData', (done) => {
        const claimData = {
          header: {
            typ: 'JWT',
            alg: 'HS256',
          },
          payload: {
            key: 'master',
            exp: Date.now() + seconds(60),
            method: 'DELETE',
            path: resource + dummyBadge.slug,
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
        data: {},
      });

      deleteBadge(
        {
          slug: dummyBadge.slug,
        },
        (err) => {
          expect(err).to.exist;
          done();
        },
      );
    });

    lab.test('passes the data to the callback', (done) => {
      const data = {
        result: [1, 2, 3],
      };

      testApiTestResponseStub.returns({
        statusCode: 200,
        data,
      });

      deleteBadge(
        {
          slug: dummyBadge.slug,
        },
        (err, res) => {
          expect(err).to.not.exist;
          expect(res).to.exist;
          done();
        },
      );
    });
  });
});
