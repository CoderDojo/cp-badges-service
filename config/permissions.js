module.exports = () => ({
  'cd-badges': {
    listBadges: [{ role: 'none' }],

    //  NOTE: Must be defined by visibility ?
    getBadge: [{ role: 'none' }],

    sendBadgeApplication: [
      { role: 'basic-user', customValidator: [{ role: 'cd-dojos', cmd: 'can_award_badge' }] },
    ],

    acceptBadge: [
      {
        role: 'basic-user',
        //  TODO : this is buggy,
        //  it seems the userId in the badge is not set making the validation not working
        // customValidator: [{
        //   role: 'cd-badges',
        //   cmd: 'ownBadge'
        // }]
      },
    ],
    //  NOTE: Must be defined by visibility ?
    loadUserBadges: [{ role: 'basic-user' }],
    loadBadgeCategories: [{ role: 'none' }],
    loadBadgeByCode: [{ role: 'none' }],
    claimBadge: [{ role: 'basic-user' }],
    exportBadges: [{ role: 'basic-user', customValidator: [{ role: 'cd-users', cmd: 'is_self' }] }],
    kpiNumberOfBadgesAwarded: [{ role: 'cdf-admin' }],
    kpiNumberOfBadgesPublished: [{ role: 'cdf-admin' }],
  },
});
