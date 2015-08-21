'use strict';

function loadBadgeCategories(args, callback) {
  var categories = ['programming', 'mentor', 'events'];
  callback(null, {categories: categories});
}

module.exports = loadBadgeCategories;

