const _ = require('lodash');

function acceptBadge(args, callback) {
  const seneca = this;
  const zenHostname = process.env.HOSTNAME || '127.0.0.1:8000';
  const badgeData = args.badgeData;
  const user = args.user;
  const protocol = process.env.PROTOCOL || 'http';

  if (badgeData.userId !== user.id && !args.badgeData.parent) {
    return callback(null, {
      error: 'Only the nominated user or their parent can accept this badge.',
    });
  }

  seneca.act(
    {
      role: 'cd-profiles',
      cmd: 'list',
      query: { userId: badgeData.userId },
    },
    (err, response) => {
      if (err) return callback(err);
      const profile = response[0];

      const badgeFound = _.find(
        profile.badges,
        userBadge => userBadge.slug === badgeData.badgeSlug,
      );

      if (!badgeFound) return callback(null, { error: 'Badge not found.' });
      if (badgeFound.status === 'accepted') { return callback(null, { error: 'This badge has already been accepted.' }); }

      badgeFound.status = 'accepted';
      badgeFound.dateAccepted = new Date();

      // Add assertion for badge baking.
      badgeFound.assertion = {
        uid: `coderdojo-${user.id}${badgeFound.id}`,
        recipient: {
          identity: user.email,
          type: 'email',
          hashed: false,
        },
        badge: `http://badgekit.coderdojo.com:8080/public/systems/coderdojo/badges/${badgeFound.slug}`,
        verify: {
          url: `${protocol}://${zenHostname}/api/1.0/verify_badge/${user.id}/${badgeFound.id}/assertion`, // url should return badgeAssertion object.
          type: 'hosted',
        },
        issuedOn: new Date(),
      };

      seneca.act({ role: 'cd-profiles', cmd: 'save', profile }, callback);
    },
  );
}

module.exports = acceptBadge;
