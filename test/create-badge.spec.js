exports.lab = require('lab').script();

const lab = exports.lab;
const { expect } = require('chai');
const sinon = require('sinon');
const jws = require('jws');
const startTestApi = require('./utils/test-server');
const getSha256Hash = require('../lib/utils/get-sha256-hash');
const createBadge = require('../lib/create-badge');

let testApi;
const seconds = sec => sec * 1000;

const badgeInfo = {
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
  criteria: [
    {
      id: 1,
      description: 'criteria description',
      required: 1,
      note: 'note for assessor',
    },
  ],
  type: 'badge type',
  categories: [],
  tags: [],
  milestones: [],
};

lab.experiment('create badge', () => {
  let sandbox;
  let clock;
  const now = 0;
  let jwsSignStub;
  let checkRequestStub;
  let testApiTestResponseStub;
  let createdBadge;
  const resource = '/systems/coderdojo/badges';
  const dummyBaseUrl = 'http://localhost:3000';
  const dummyToken = 'dummyToken';
  const dummySecret = 'dummySecret';

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
    testApiTestResponseStub = sandbox.stub(testApi, 'getTestResponse').returns({
      statusCode: 201,
      data: [1, 2, 3],
    });

    createdBadge = createBadge({
      apiBaseUrl: dummyBaseUrl,
      apiSecret: dummySecret,
    });

    done();
  });

  lab.afterEach((done) => {
    sandbox.restore();
    done();
  });

  lab.experiment('request', () => {
    lab.beforeEach((done) => {
      clock = sinon.useFakeTimers(now);
      createdBadge(
        {
          badgeInfo,
        },
        done,
      );
    });

    lab.afterEach((done) => {
      clock.restore();
      done();
    });

    lab.test('makes a POST request to /systems/coderdojo/badges', (done) => {
      expect(checkRequestStub.args[0][0].method).to.equal('POST');
      expect(checkRequestStub.args[0][0].url).to.equal(resource);
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
            method: 'POST',
            path: resource,
            body: {
              alg: 'sha256',
              hash: getSha256Hash(JSON.stringify(badgeInfo)),
            },
          },
          secret: dummySecret,
        };

        expect(jwsSignStub.args[0][0]).to.deep.equal(claimData);
        done();
      });
    });
  });

  lab.experiment('response', () => {
    lab.test('passes the error to the callback', (done) => {
      testApiTestResponseStub.returns({
        statusCode: 500,
        data: {},
      });

      createdBadge(
        {
          badgeInfo,
        },
        (err) => {
          expect(err).to.exist;
          done();
        },
      );
    });

    lab.test('passes the data to the callback', (done) => {
      createdBadge(
        {
          badgeInfo,
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
