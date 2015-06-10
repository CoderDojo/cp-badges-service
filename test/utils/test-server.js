'use strict';

var http = require('http');

function startTestApi(callback) {

    var testApi = {
        checkRequest: function() {},
        getTestResponse: function() {
            return {
                statusCode: 200,
                data: {}
            };
        }
    };

    testApi.server = http.createServer(function(req, res) {
        testApi.checkRequest(req);
        res.setHeader('Content-Type', 'application/json');

        var testData = testApi.getTestResponse();
        res.writeHead(testData.statusCode);
        res.end(JSON.stringify(testData.data));
    }).listen(3000, 'localhost', callback);

    return testApi;
}

module.exports = startTestApi;
