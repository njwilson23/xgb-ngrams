var path = require('path');

module.exports = {
  entry: './app/interactions.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
