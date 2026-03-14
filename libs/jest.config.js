/** @type {import('jest').Config} */
module.exports = {
  displayName: 'shared',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [
          '@babel/preset-env',
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/shared',
  testEnvironment: 'jsdom',
};
