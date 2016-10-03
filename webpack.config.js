/* eslint-env node */

// Load Promise polyfill (needed by css-loader -> postcss)
require('es6-promise').polyfill();

var path = require('path');
var execSync = require('child_process').execSync;
var HtmlPlugin = require('html-webpack-plugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
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

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: SRC_ROOT,
                loaders: ['babel?cacheDirectory']
            },
            {
                test: /\.svg$/,
                exclude: /font-awesome/,
                loader: 'url-loader?limit=10000'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    'css?sourceMap!resolve-url?sourceMap!sass?sourceMap'
                )
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style',
                    'css?sourceMap'
                )
            }
        ]
    },

    plugins: [

        new DedupePlugin(),

        // // Split out runtime bundle
        // new CommonsChunkPlugin({
        //     name: 'runtime',
        //     filename: runtimeFilename,
        //     minChunks: Infinity
        // }),

        new HtmlPlugin({
            IS_PROD: PROD,
            deployment: NODE_ENV,
            template: './src/layout/app.html',
            // favicon: './src/assets/favicon.ico',
            inject: false
        }),

        // Only support default moment locale (en-us) for now.
        new ContextReplacementPlugin(/moment[\/\\]locale$/, /^$/),

        new ExtractTextPlugin(cssFilename)

    ],

    debug: DEBUG,

    devtool: DEBUG ? 'source-map' : null,

    devServer: {
        historyApiFallback: true
    },

    resolveLoader: {
        modulesDirectories: [
            'node_modules',
            'web_loaders'
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx'],
        root: path.resolve(SRC_ROOT, 'app'),
        modulesDirectories: ['node_modules'],
        alias: {}
    }

};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Production
//
// Optimize for deployment (compression, splitting, etc)
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (PROD) {
    Array.prototype.push.apply(webpackConfig.plugins, [

        new UglifyJsPlugin({
            mangle: true
        }),

        new CompressionPlugin()

    ]);
}

module.exports = webpackConfig;
