'use strict';

var fs = require('fs');

module.exports = function(options) {
  var seneca = this;
  var plugin = 'cd-profiles';
  var badgeData = JSON.parse(fs.readFileSync(__dirname + '/../data/badgeData.json', 'utf8'));

  seneca.add({role: plugin, cmd: 'list'}, cmd_list);

  function cmd_list(args, done) {
    done(null, [{badges: badgeData}]);
  }

  return {
    name: plugin
  };
};