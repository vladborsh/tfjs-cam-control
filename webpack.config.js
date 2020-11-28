const path = require('path');

module.exports = {
  entry:{
    demo_1: './src/demo_1/index.js',
    demo_2: './src/demo_2/index.js',
  },
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
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [],
};
