const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: './lib/main-compiled.js',
   output: {
     filename: 'bundle.js',
     path: path.resolve(__dirname, 'dist')
   },
   module: {
     rules: [
       {
         test: /\.(js|jsx)$/,
         exclude: /node_modules/,
         use: {
           loader: "babel-loader"
         }
       }
     ]
   },
   stats: {
       colors: true
   },
   devtool: 'source-map'
};
