/* eslint-env node */
var path = require('path');
var TEST_DATA_DIR = path.resolve(__dirname, 'test-data');
var SRC_DIR = path.resolve(__dirname, 'src');


module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        files: [
            { pattern: 'node_modules/babel-polyfill/dist/polyfill.js', watched: false },
            'src/**/*.benchmark.js'
        ],

        preprocessors: {
          'src/**/*.js': ['webpack']
        },

        frameworks: ['benchmark'],

        reporters: ['benchmark'],

        // web server port
        port: 9876,

        // cli runner port
        runnerPort: 9100,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Start these browsers
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        webpack: {
            devtool: 'inline-source-map',
            bail: true,
            profile: true,
            plugins: [],
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        include: [SRC_DIR, /tiny-trie/],
                        use: [{
                            loader: 'babel-loader',
                            options: { cacheDirectory: true }
                        }]
                    },
                    {
                        test: /\.json$/,
                        include: [TEST_DATA_DIR],
                        use: [{ loader: 'json-loader' }]
                    }
                ],
                noParse: [
                    /node_modules\/sinon/,
                ]
            },
            resolve: {
                extensions: ['.js', '.jsx'],
                modules: [path.resolve(__dirname, 'node_modules')],
                alias: {
                    'test-data': TEST_DATA_DIR
                }
            }
        },

        plugins: [
            'karma-benchmark',
            'karma-benchmark-reporter',
            'karma-webpack',
            'karma-phantomjs-launcher'
        ]
    });
};
