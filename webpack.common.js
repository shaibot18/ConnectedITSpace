const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app/app.js',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Connected IT Space',
      template: './app/index.html'
    })
    // new CopyWebpackPlugin([
    //   { from: './app' }
    // ])
  ],
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};
