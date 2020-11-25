const path = require('path');

module.exports = {
  entry: './src/demo_1/index.js',
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
    filename: 'demo1.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [],
};
