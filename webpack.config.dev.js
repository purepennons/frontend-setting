const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const basePath = path.resolve(__dirname)
const appPath = path.join(basePath, 'src')
const bundlePath = path.join(basePath, 'dist')
const staticPath = path.join(basePath, 'public')

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

    devtool: 'inline-source-map',

    devServer: {
        contentBase: staticPath,
        publicPath: '/',    // I don't know why need to set '/', not '/dist/' =_=
        compress: true,
        clientLogLevel: 'none',
        watchContentBase: true,
        hot: true,
        quiet: true,
        watchOptions: {
            ignored: /node_modules/,
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
                        }
                    }
                ]
            },
            {
                exclude: [
                    /\.html$/,
                    /\.(js|jsx)$/,
                    /\.(css|scss)$/,
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
                        }
                    }
                ]    
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            cacheDirectory: true,
                            presets: [
                                ['es2015', { modules: false, loose: false }]
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: {
                        loader: require.resolve('style-loader'),
                        options: { modules: true, sourceMap: true }
                    },
                    use: [
                        {
                            loader: require.resolve('css-loader'),
                            options: { importLoaders: 1, sourceMap: true }
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
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
                                ],
                            }
                        },
                        {
                            loader: require.resolve('sass-loader'),
                            options: { sourceMap: true }
                        }
                    ]
                })
                
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(['dist', 'build/*.*'], {
            root: basePath,
            verbose: true,
            dry: false,
            watch: false,
            exclude: [],
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.join(staticPath, 'index.html'),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'static/js/commons.[hash:8].js'
        }),
        new ExtractTextPlugin('static/css/[name].[hash:8].bundle.css'),
        new CopyWebpackPlugin([
            { from: staticPath, to: bundlePath },
        ], {ignore: ['index.html']}),
        new webpack.HotModuleReplacementPlugin(),
    ]
}