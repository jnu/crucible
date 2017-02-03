/* eslint-env node */
var path = require('path');
var TEST_DATA_DIR = path.resolve(__dirname, 'test-data');
var SRC_DIR = path.resolve(__dirname, 'src');


module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        files: [
            { pattern: 'node_modules/chai/chai.js', watched: false },
            'src/**/*.spec.js'
        ],

        preprocessors: {
          'src/**/*.js': ['webpack']
        },

        frameworks: ['mocha', 'sinon'],

        reporters: ['mocha'],

        mochaReporter: {
            showDiff: 'inline'
        },

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
        browsers: ['PhantomJS2'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        webpack: {
            devtool: 'inline-source-map',
            debug: true,
            bail: true,
            profile: true,
            plugins: [],
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        include: [SRC_DIR, /tiny-trie/],
                        loaders: ['babel?cacheDirectory']
                    },
                    {
                        test: /\.json$/,
                        include: [TEST_DATA_DIR],
                        loaders: ['json']
                    }
                ],
                noParse: [
                    /node_modules\/sinon/,
                ]
            },
            resolve: {
                extensions: ['', '.js', '.jsx'],
                root: path.resolve(__dirname, 'node_modules'),
                alias: {
                    'test-data': TEST_DATA_DIR
                }
            }
        },

        plugins: [
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-sinon',
            'karma-webpack',
            'karma-phantomjs2-launcher'
        ]
    });
};
