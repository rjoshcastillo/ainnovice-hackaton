// webpack.config.js
import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
  mode: 'production', // Change to 'development' for development mode
  entry: './api/index.js', // Your serverless function entry point
  target: 'node', // Specify that we're targeting Node.js
  externals: [nodeExternals()], // Exclude node_modules from the bundle
  output: {
    path: path.resolve('dist'), // Output directory
    filename: 'index.js', // Output file name
    libraryTarget: 'commonjs2', // CommonJS2 format for Node.js
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel to .js files
        exclude: /node_modules/, // Exclude node_modules from Babel processing
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Use the env preset for Babel
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'], // Resolve .js files
  },
};
