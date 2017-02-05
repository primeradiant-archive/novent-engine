// Karma configuration
// Generated on Mon Jan 04 2016 20:30:11 GMT-0800 (PST)

module.exports = function(config) {
    config.set({
        frameworks: ["mocha", "chai-spies", "chai", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" },
            { pattern: "test/**/*.ts" },
            { pattern: "dependencies/**/*.js" }
        ],
        preprocessors: {
            "src/**/*.ts": ["karma-typescript"],
            "test/**/*.ts": ["karma-typescript"],
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["PhantomJS"]
    });
};
