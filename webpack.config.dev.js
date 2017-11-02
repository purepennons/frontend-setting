const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');

const basePath = path.resolve(__dirname);
const appPath = path.join(basePath, 'src');
const bundlePath = path.join(basePath, 'dist');
const staticPath = path.join(basePath, 'public');
const publicUrl = '';

const postCSSOption = {
  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
  sourceMap: 'inline',
  plugins: () => [
    require('precss'),
    require('postcss-flexbugs-fixes'),
    require('autoprefixer')({
      // browsers: [
      //     '>1%',
      //     'last 4 versions',
      //     'Firefox ESR',
      //     'not ie < 9', // React doesn't support IE8 anyway
      // ],
      // flexbox: 'no-2009',
    }),
    require('rucksack-css'),
  ],
};

module.exports = {
  context: appPath,

  entry: {
    index: path.join(appPath, 'index.js'),
  },

  output: {
    path: bundlePath,
    pathinfo: true,
    filename: 'static/js/[name].[hash:8].bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    // publicPath:
  },

  devtool: 'cheap-module-source-map',

  devServer: {
    contentBase: staticPath,
    publicPath: '/', // I don't know why need to set '/', not '/dist/' =_=
    port: 8080,
    compress: true,
    clientLogLevel: 'none',
    watchContentBase: true,
    hot: true,
    quiet: false,
    watchOptions: {
      ignored: /node_modules/,
      poll: true,
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.(css|sass|scss|styl)$/,
          /\.json$/,
          /\.bmp$/,
          /\.gif$/,
          /\.jpe?g$/,
          /\.png$/,
        ],
        use: [
          {
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: true,
              presets: [['es2015', { modules: false, loose: false }]],
            },
          },
        ],
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options: { modules: false, sourceMap: true },
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 2,
              sourceMap: true,
              modules: false,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: postCSSOption,
          },
          {
            loader: require.resolve('sass-loader'),
            options: { sourceMap: true },
          },
        ],
      },

      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options: { modules: false, sourceMap: true },
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              modules: false,
              sourceMap: true,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: postCSSOption,
          },
        ],
      },
    ],
  },

  plugins: [
    new InterpolateHtmlPlugin({
      PUBLIC_URL: publicUrl,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'static/js/commons.[hash:8].js',
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(staticPath, 'index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
