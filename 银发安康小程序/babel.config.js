module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { chrome: '49' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
}
