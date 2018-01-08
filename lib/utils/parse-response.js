function parseResponse(expectedStatusCode, cb, error, response, body) {
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body); // eslint-disable-line no-param-reassign
    } catch (e) {
      return cb(e);
    }
  }

  if (!error && response.statusCode === expectedStatusCode) return cb(null, body);

  return cb(error || new Error(body.message));
}

module.exports = parseResponse;
