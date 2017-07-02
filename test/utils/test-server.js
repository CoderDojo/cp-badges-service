const http = require('http');

function startTestApi(callback) {
  const testApi = {
    checkRequest() {},
    getTestResponse() {
      return {
        statusCode: 200,
        data      : {},
      };
    },
  };

  testApi.server = http.createServer((req, res) => {
    testApi.checkRequest(req);
    res.setHeader('Content-Type', 'application/json');

    const testData = testApi.getTestResponse();
    res.writeHead(testData.statusCode);
    res.end(JSON.stringify(testData.data));
  }).listen(3000, 'localhost', callback);

  return testApi;
}

module.exports = startTestApi;
