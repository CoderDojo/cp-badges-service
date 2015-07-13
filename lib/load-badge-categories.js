'use strict';

function loadBadgeCategories(args, callback) {
  var categories = ['programming', 'attendance', 'mentor'];
  callback(null, {categories: categories});
}

module.exports = loadBadgeCategories;

