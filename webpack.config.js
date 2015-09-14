var path = require('path');

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
                loaders: ['react-hot', 'jsx-loader?insertPragma=React.DOM&harmony']
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React'
    }
}
