export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['core', 'wc', 'builder', 'embed', 'docs', 'examples', 'repo', 'ci', 'deps', 'release'],
    ],
    'subject-case': [0],
  },
};
