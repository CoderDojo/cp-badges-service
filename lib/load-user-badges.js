function loadUserBadges(args, callback) {
  const seneca = this;
  const userId = args.userId;

  // Retrieve the badges through the cd_profiles cmd_list action to apply security checks.
  seneca.act({ role: 'cd-profiles', cmd: 'list', query: { userId } }, (err, response) => {
    if (err) return callback(err);
    const badges = response.badges;
    return callback(null, badges);
  });
}

module.exports = loadUserBadges;
