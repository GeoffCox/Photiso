const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

// This is the object webpack looks at for configuration.
// Webpack doesn't  care about any other javascript in the file.  
// Because this is javascript, you can write functions to help build up the configuration.

module.exports = [
  // --- Electron Main ---
  {
    // Tells webpack what kind of source maps to produce.  
    // There are a lot of options, but I chose the complete separate file option.
    devtool: "source-map",

    // Tells webpack where start walking the dependencies to build a bundle.
    // This can be multiple locations, but you can also have multiple module.exports
    entry: {
      main: "./src/main/index.ts"
    },

    // Tells webpack how to run file transformation pipeline of webpack.  
    // Awesome-typescript-loader will run on all typescript files.
    // Source-map-loader will run on the JS files.
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        {
          test: /\.tsx?$/,
          loaders: ["awesome-typescript-loader"],
          exclude: /node_modules/
        },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader"
        }
      ]
    },

    // Tells webpack not to touch __dirname and __filename.
    // If you run the bundle in node.js it falls back to these values of node.js.
    // https://github.com/webpack/webpack/issues/2010
    node: {
      __dirname: false,
      __filename: false
    },

    // Tells webpack where to output the bundled javascript
    output: {
      filename: "[name]_bundle.js",
      path: path.resolve(__dirname, "dist")
    },

    // Tells webpack what file extesions it should look at.
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js", ".json"]
    },

    // Tells webpack that we are producing a bundle intended to run as electron's main entry poi.
    target: "electron-main"
  },
  //--- React Application ---
  {
    // Tells webpack what kind of source maps to produce.  
    // There are a lot of options, but I chose the complete separate file option.
    devtool: "source-map",

    // Tells webpack where start walking the dependencies to build a bundle.
    // This can be multiple locations, but you can also have multiple module.exports
    // I inject the hot-middleware before the index.tsx
    entry: {
      app: [
        "webpack-hot-middleware/client", 
        "./src/app/index.tsx"
      ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
      "react": "React",
      "react-dom": "ReactDOM"
    },

    // Tells webpack how to run file transformation pipeline of webpack.  
    // Awesome-typescript-loader will run on all typescript files.
    // Source-map-loader will run on the JS files.
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        { 
          test: /\.tsx?$/, 
          loaders: ["awesome-typescript-loader"]
        },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { 
          enforce: "pre", 
          test: /\.js$/, 
          loader: "source-map-loader" }
      ]
    },

    // Tells webpack not to touch __dirname and __filename.
    // If you run the bundle in node.js it falls back to these values of node.js.
    // https://github.com/webpack/webpack/issues/2010
    node: {
      __dirname: false,
      __filename: false
    },

    // Tells webpack where to output the bundled javascript
    output: {
      filename: "[name]_bundle.js",
      path: path.resolve(__dirname, "dist")
    },

    // Tells the HTML webpack plug-in to use a template and emit dist/index.html
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        title: 'Photiso',
        inject: false,
        template: require('html-webpack-template'),
        appMountId: 'app',
        scripts: [
          'https://unpkg.com/react@16.3.2/umd/react.development.js',
          'https://unpkg.com/react-dom@16.3.2/umd/react-dom.development.js'
        ],        
      })      
    ],

    // Tells webpack what file extesions it should look at.
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },

    // Tells webpack that we are producing a bundle intended to render within electron.
    target: "electron-renderer"
  }
];
