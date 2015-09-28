var path = require('path');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

module.exports = {
    entry: [
      'webpack/hot/dev-server', // "only" prevents reload on syntax errors
      './app/app.js' // Your appʼs entry point
    ],
    output: {
        filename: 'bundle.js', //this is the default name, so you can skip it
        //at this directory our bundle file will be available
        //make sure port 8090 is used when launching webpack-dev-server
        publicPath: '/assets'
    },
    module: {
        loaders: [
            {
                //tell webpack to use jsx-loader for all *.jsx files
                test: /\.js$/,
                loaders: ['react-hot', 'jsx-loader?insertPragma=React.DOM&harmony'],
                exclude: [node_modules_dir]
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    }
}
