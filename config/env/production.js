'use strict';

module.exports = {
    env: 'production',
    hostname: 'http://localhost:3000',
    app: {
        name: 'Linked Data Browser'
    },
    logging: {
        format: 'combined'
    },
    strategies: {
        local: {
            enabled: true
        },
        google: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/api/auth/google/callback',
            enabled: false
        }
    },
    secret: 'SOME_TOKEN_SECRET'
};