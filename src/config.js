'use strict';

let config = {
    // Production configuration
    production: {
        api:     'http://api.bazalt.io/',
        version: '0.0.0-prod'
    },

    // Development configuration
    development: {
        api:     'http://api.bazalt.dev:1337/',
        version: '0.0.0-dev'
    }
};

module.exports = config;
