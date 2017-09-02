module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb'],
  plugins: ['chai-friendly'],
  rules: {
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'linebreak-style': ['error', 'unix'],
    'no-param-reassign': ['error', { props: false }],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'no-use-before-define': ['error', { functions: false }],
    'consistent-return': 0,
  },
};
