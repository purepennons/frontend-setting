const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const basePath = path.resolve(__dirname)
const appPath = path.join(basePath, 'src')
const bundlePath = path.join(basePath, 'dist')
const staticPath = path.join(basePath, 'public')

const postCSSOption = {
    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
    sourceMap: 'inline',
    plugins: () => [
        require('cssnano')({
            preset: [
                'default',
            ]
        }),
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
}

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
        publicPath: '/',    // I don't know why need to set '/', not '/dist/' =_=
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
                        }
                    }
                ]
            },
            {
                exclude: [
                    /\.html$/,
                    /\.(js|jsx)$/,
                    /\.(css|scss|styl)$/,
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
                test: /\.(sass|scss)$/,
                use: ExtractTextPlugin.extract({
                    fallback: {
                        loader: require.resolve('style-loader'),
                        options: { modules: true, sourceMap: true }
                    },
                    use: [
                        // for sass: sass-loader -> postcss 
                        // don't forget to change the extension to /\.(sass|scss)$/
                        {
                            loader: require.resolve('postcss-loader'),
                            options: postCSSOption
                        },
                        {
                            loader: require.resolve('sass-loader'),
                            options: { sourceMap: true }
                        }
                    ]
                })
                
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: {
                        loader: require.resolve('style-loader'),
                        options: { modules: true, sourceMap: true }
                    },
                    use: [
                        {
                            loader: require.resolve('postcss-loader'),
                            options: postCSSOption
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
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'static/js/commons.[hash:8].js'
        }),
        // when enable this module, any change of stylesheet wiil not tigger the HMR
        new ExtractTextPlugin({
            disable: false,
            filename: 'static/css/[name].[hash:8].bundle.css',
            allChunks: true
        }),
        new CopyWebpackPlugin([
            { from: staticPath, to: bundlePath },
        ], {ignore: ['index.html']}),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.join(staticPath, 'index.html'),
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                // Disabled because of an issue with Uglify breaking seemingly valid code:
                // https://github.com/facebookincubator/create-react-app/issues/2376
                // Pending further investigation:
                // https://github.com/mishoo/UglifyJS2/issues/2011
                comparisons: false,
            },
            output: {
                comments: false,
                // Turned on because emoji and regex is not minified properly using default
                // https://github.com/facebookincubator/create-react-app/issues/2488
                ascii_only: true,
            },
            sourceMap: true,
        }),
    ]
}