/* eslint-env node */

// Load Promise polyfill (needed by css-loader -> postcss)
require('es6-promise').polyfill();

const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const MiniCssPlugin = require('mini-css-extract-plugin');


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Build env info
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const NODE_ENV = process.env.NODE_ENV || 'development';


// Infer modes based on env.
const DEBUG = NODE_ENV !== 'production';
const PROD = NODE_ENV === 'production';
const SRC_ROOT = path.resolve(__dirname, 'src');
const DATA_ROOT = path.resolve(__dirname, 'data');


// Asset bundles. Prod-like environments get fingerprinted for cache busting,
// others get labeled for debugging.
const appFilename = 'app-' + (PROD ? '[hash]' : NODE_ENV) + '.js';
const cssFilename = 'styles-' + (PROD ? '[contenthash]' : NODE_ENV) + '.css';


/**
 * Webpack configuration
 * @type {Object}
 */
const webpackConfig = {

    context: path.resolve(SRC_ROOT),

    entry: {
        app: './index.js'
    },

    output: {
        path: path.resolve(__dirname, 'build', 'app'),
        filename: appFilename,
        globalObject: 'this',
    },

    mode: PROD ? 'production' : 'development',

    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                include: [SRC_ROOT, /tiny-trie/],
                use: [{
                    loader: 'ts-loader',
                    options: {
                      configFile: 'tsconfig.json',
                    },
                }]
            },
            {
                test: /\.svg$/,
                exclude: /font-awesome/,
                use: [{ loader: 'url-loader', options: { limit: 10000 } }]
            },
            {
                test: /\.scss$/,
                use: [
                  { loader: PROD ? MiniCssPlugin.loader : 'style-loader' },
                  { loader: 'css-loader', options: { sourceMap: !PROD } },
                  { loader: 'resolve-url-loader', options: { sourceMap: !PROD } },
                  { loader: 'sass-loader', options: { sourceMap: !PROD } }
                ],
            },
            {
                test: /\.css$/,
                use: [
                  { loader: PROD ? MiniCssPlugin.loader : 'style-loader' },
                  { loader: 'css-loader', options: { sourceMap: !PROD } },
                ],
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

        new MiniCssPlugin({
            filename: cssFilename,
        }),

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
