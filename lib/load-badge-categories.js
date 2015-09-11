'use strict';

function loadBadgeCategories (args, callback) {
  var categories = ['programming', 'soft-skills', 'events'];
  callback(null, {categories: categories});
}

module.exports = loadBadgeCategories;
