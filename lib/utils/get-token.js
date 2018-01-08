const jws = require('jws');
const getSha256Hash = require('./get-sha256-hash');

const seconds = sec => sec * 1000;

function getToken(resource, apiSecret, method, body) {
  const claimData = {
    header: {
      typ: 'JWT',
      alg: 'HS256',
    },
    payload: {
      key: 'master',
      exp: Date.now() + seconds(60),
      method: method || 'GET',
      path: resource,
    },
    secret: apiSecret,
  };

  if (body) {
    claimData.payload.body = {
      alg: 'sha256',
      hash: getSha256Hash(body),
    };
  }

  return jws.sign(claimData);
}

module.exports = getToken;
