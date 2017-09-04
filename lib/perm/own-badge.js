function ownBadge(args, callback) {
  const requestUser = args.user.id;
  const badgeUser = args.params.badgeData.userId;
  let validity = false;
  if (requestUser === badgeUser) validity = true;
  return callback(null, { allowed: validity });
}

module.exports = ownBadge;
