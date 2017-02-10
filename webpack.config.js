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
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};
