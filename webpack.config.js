/* eslint-env node */

// Load Promise polyfill (needed by css-loader -> postcss)
require('es6-promise').polyfill();

var path = require('path');
var HtmlPlugin = require('html-webpack-plugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var CompressionPlugin = require('compression-webpack-plugin');
var ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Build env info
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var NODE_ENV = process.env.NODE_ENV || 'development';


// Infer modes based on env.
var DEBUG = NODE_ENV !== 'production';
var PROD = NODE_ENV === 'production';
var SRC_ROOT = path.resolve(__dirname, 'src');
var DATA_ROOT = path.resolve(__dirname, 'data');


// Asset bundles. Prod-like environments get fingerprinted for cache busting,
// others get labeled for debugging.
var appFilename = 'app-' + (PROD ? '[hash]' : NODE_ENV) + '.js';
var cssFilename = 'styles-' + (PROD ? '[contenthash]' : NODE_ENV) + '.css';


/**
 * Webpack configuration
 * @type {Object}
 */
var webpackConfig = {

    context: path.resolve(SRC_ROOT),

    entry: {
        app: './index.js'
    },

    output: {
        path: path.resolve(__dirname, 'build', 'app'),
        filename: appFilename
    },

    mode: PROD ? 'production' : 'development',

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [SRC_ROOT, /tiny-trie/],
                use: [{
                    loader: 'babel-loader',
                    options: { cacheDirectory: true }
                }]
            },
            {
                test: /\.tsx?$/,
                include: [SRC_ROOT, /tiny-trie/],
                use: [{
                    loader: 'babel-loader',
                    options: { cacheDirectory: true }
                }, {
                    loader: 'ts-loader'
                }]
            },
            {
                test: /\.svg$/,
                exclude: /font-awesome/,
                use: [{ loader: 'url-loader', options: { limit: 10000 } }]
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { sourceMap: !PROD } },
                        { loader: 'resolve-url-loader', options: { sourceMap: !PROD } },
                        { loader: 'sass-loader', options: { sourceMap: !PROD } }
                    ]
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{ loader: 'css-loader', options: { sourceMap: !PROD } }]
                })
            },
            {
                test: /\.dawg$/,
                include: [DATA_ROOT],
                use: [{ loader: 'raw-loader' }],
            }
        ]
    },

    plugins: [

        new DefinePlugin({
            DEBUG: !PROD
        }),

        new HtmlPlugin({
            IS_PROD: PROD,
            deployment: NODE_ENV,
            template: './layout/app.html',
            // favicon: './src/assets/favicon.ico',
            inject: false
        }),

        // Only support default moment locale (en-us) for now.
        new ContextReplacementPlugin(/moment[\/\\]locale$/, /^$/),

        new ExtractTextPlugin({
            filename: cssFilename,
            disable: !PROD,
            allChunks: true
        })

    ],

    devtool: DEBUG ? 'source-map' : null,

    devServer: {
        historyApiFallback: true
    },

    resolveLoader: {
        modules: [
            'node_modules',
            'web_loaders'
        ]
    },

    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: [
            path.resolve(SRC_ROOT, 'app'),
            'node_modules'
        ],
        alias: {
            data: DATA_ROOT
        }
    }

};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Production
//
// Optimize for deployment (compression, splitting, etc)
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (PROD) {
    Array.prototype.push.apply(webpackConfig.plugins, [

        new CompressionPlugin()

    ]);
}

module.exports = webpackConfig;
