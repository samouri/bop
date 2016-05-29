var path = require('path');

module.exports = {
  entry: './app/app.js', // Your appʼs entry point
  output: {
    filename: 'static/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['jsx-loader?insertPragma=React.DOM&harmony', "babel-loader"],
        exclude: /node_modules/
      },
      { test: /\.scss$/, loaders: ["style", "css", "sass"] },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
}
