'use strict';

function loadBadgeCategories (args, callback) {
  const categories = ['programming', 'soft-skills', 'events'];
  callback(null, {categories: categories});
}

module.exports = loadBadgeCategories;
