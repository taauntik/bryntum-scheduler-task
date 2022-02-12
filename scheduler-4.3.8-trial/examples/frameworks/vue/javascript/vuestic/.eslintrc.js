module.exports = {
  root: true,
  env: {
    node: true
  },
  "globals": {
    "Vue": true
  },
  'extends': [
    'plugin:vue/essential',
    '../../../../.eslintrc.json'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ['error', 'only-multiline']
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
}
