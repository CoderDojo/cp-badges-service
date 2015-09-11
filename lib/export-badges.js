'use strict';

var async = require('async');
var request = require('request');
var bakery = require('openbadges-bakery');

function exportBadges (args, callback) {
  var seneca = this;
  var user = args.user;

  async.waterfall([
    loadUsersBadges,
    downloadBadgeImages,
    bakeBadgeImages
  ], function (err, res) {
    if (err) return callback(null, {error: err.message});
    return callback(null, res);
  });

  function loadUsersBadges (done) {
    seneca.act({role: 'cd-profiles', cmd: 'list', query: {userId: user.id}}, function (err, response) {
      if (err) return done(err);
      var profile = response[0];
      return done(null, profile.badges);
    });
  }

  function downloadBadgeImages (badges, done) {
    var badgeData = [];
    async.each(badges, function (badge, cb) {
      if (!badge.assertion) return cb();
      download(badge.imageUrl, badge.slug + '.png', function (err, response) {
        if (err) return cb(err);
        badge.encodedImage = response;
        badgeData.push(badge);
        cb();
      });
    }, function (err) {
      if (err) return done(err);
      return done(null, badgeData);
    });
  }

  function bakeBadgeImages (badgeData, done) {
    var bakedBadges = [];
    async.eachSeries(badgeData, function (badge, cb) {
      var badgeImage = badge.encodedImage;
      var badgeAssertion = badge.assertion;
      var options = {
        image: badgeImage,
        assertion: badgeAssertion
      };

      // bake assertion into image
      bakery.bake(options, function (err, data) {
        if (err) return done(err);
        bakedBadges.push(data);
        cb();
      });
    }, function (err) {
      if (err) return done(err);
      return done(null, bakedBadges);
    });
  }

  var download = function (uri, filename, callback) {
    request.get({uri: uri, encoding: null}, function (err, res, body) {
      if (err) return callback(err);
      return callback(null, body);
    });
  };
}

module.exports = exportBadges;
