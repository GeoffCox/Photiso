var http = require('http');
var express = require('express');

var app = express();

(function() {
  // Step 1: Create & configure a webpack compiler
  var webpack = require('webpack');
  var webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config.js');

  var appWebpackConfig = Object.assign(webpackConfig[1], { mode: "development"});
  var compiler = webpack(appWebpackConfig);

  // Step 2: Attach the dev middleware to the compiler & the server
  app.use(require("webpack-dev-middleware")(compiler, {
    headers: {
        "Access-Control-Allow-Origin": "http://localhost"
    }, 
    lazy: false,
    publicPath: appWebpackConfig.output.publicPath,
    noInfo: false,
    stats: { colors: true }
  }));

  // Step 3: Attach the hot middleware to the compiler & the server
  app.use(require("webpack-hot-middleware")(compiler));
  
})();

if (require.main === module) {
    var server = http.createServer(app);
    server.listen(process.env.PORT || 1616, function() {
      console.log("Listening on %j", server.address());
    });
  }