function loadBadgeCategories(args, callback) {
  const categories = ['programming', 'soft-skills', 'events'];
  callback(null, { categories });
}

module.exports = loadBadgeCategories;
