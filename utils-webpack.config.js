const path = require('path');

module.exports = {
  entry: './utils/data-processor.js',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: 'utils.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [],
};
