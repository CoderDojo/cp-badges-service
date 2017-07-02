const fs = require('fs');

function cdProfile() {
  const seneca = this;
  const plugin = 'cd-profiles';
  const badgeData = JSON.parse(fs.readFileSync(`${__dirname}/../data/badgeData.json`, 'utf8'));

  seneca.add({ role: plugin, cmd: 'list' }, cmd_list);

  function cmd_list(args, done) {
    done(null, [{ badges: badgeData }]);
  }

  return {
    name: plugin,
  };
}
module.exports = cdProfile;
