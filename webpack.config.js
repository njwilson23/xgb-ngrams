var path = require('path');

module.exports = {
  entry: {
    main: './app/main.js',
    interactions: './app/interactions.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    //library: 'xgbi',
    //libraryTarget: 'var'
  }
};
