var path = require('path');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

module.exports = {
  entry: [
    './app/app.js' // Your appʼs entry point
  ],
  output: {
    filename: 'bundle.js', //this is the default name, so you can skip it
    //at this directory our bundle file will be available
    //make sure port 8090 is used when launching webpack-dev-server
    publicPath: 'http://localhost:8091/assets/'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: [node_modules_dir]
      }
    ],
    loaders: [
      {
        //tell webpack to use jsx-loader for all *.jsx files
        test: /\.js$/,
        loaders: ['react-hot', 'jsx-loader?insertPragma=React.DOM&harmony', "babel-loader"],
        exclude: [node_modules_dir]
      },
      { test: /\.scss$/, loaders: ["style", "css", "sass"] },
      { test: /\.css$/, loader: 'style-loader!css-loader'  }
    ]
  }
}
