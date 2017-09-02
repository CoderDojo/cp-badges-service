const async = require('async');
const request = require('request');
const bakery = require('openbadges-bakery');

function exportBadges(args, callback) {
  const seneca = this;
  const user = args.user;

  async.waterfall([loadUsersBadges, downloadBadgeImages, bakeBadgeImages], (err, res) => {
    if (err) return callback(null, { error: err.message });
    return callback(null, res);
  });

  function loadUsersBadges(done) {
    seneca.act(
      { role: 'cd-profiles', cmd: 'list', query: { userId: user.id } },
      (err, response) => {
        if (err) return done(err);
        const profile = response[0];
        return done(null, profile.badges);
      },
    );
  }

  function downloadBadgeImages(badges, done) {
    const badgeData = [];
    async.each(
      badges,
      (badge, cb) => {
        if (!badge.assertion) return cb();
        download(badge.imageUrl, `${badge.slug}.png`, (err, response) => {
          if (err) return cb(err);
          badge.encodedImage = response;
          badgeData.push(badge);
          cb();
        });
      },
      (err) => {
        if (err) return done(err);
        return done(null, badgeData);
      },
    );
  }

  function bakeBadgeImages(badgeData, done) {
    const bakedBadges = [];
    async.eachSeries(
      badgeData,
      (badge, cb) => {
        const badgeImage = badge.encodedImage;
        const badgeAssertion = badge.assertion;
        const options = {
          image: badgeImage,
          assertion: badgeAssertion,
        };

        // bake assertion into image
        bakery.bake(options, (err, data) => {
          if (err) return done(err);
          bakedBadges.push(data);
          cb();
        });
      },
      (err) => {
        if (err) return done(err);
        return done(null, bakedBadges);
      },
    );
  }

  function download(uri, filename, done) {
    request.get({ uri, encoding: null }, (err, res, body) => {
      if (err) return done(err);
      return done(null, body);
    });
  }
}

module.exports = exportBadges;
