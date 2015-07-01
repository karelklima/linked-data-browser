'use strict';

module.exports = {
    env: 'development',
    debug: true,
    logging: {
        format: 'tiny'
    },
    aggregate: false,
    mongoose: {
        debug: false
    },
    hostname: 'http://localhost:3000',
    app: {
        name: 'Linked Data Browser [dev]'
    },
    strategies: {
        local: {
            enabled: true
        },
        google: {
            clientID: 'DEFAULT_APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/api/auth/google/callback',
            enabled: false
        }
    },
    secret: 'SOME_TOKEN_SECRET'
};
