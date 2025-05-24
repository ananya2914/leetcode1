const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup.ts',
    content: './src/content.ts',
    background: './src/background.ts',
    options: './src/options.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public' },
        { from: 'manifest.json' },
      ],
    }),
  ],
  optimization: {
    minimize: false, // Disable minification to avoid eval issues
  },
  devtool: 'source-map', // Use source maps instead of eval
}; 