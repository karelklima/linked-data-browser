'use strict';

module.exports = {
    db: 'mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/ld-browser-dev',
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
        name: 'MEAN - A Modern Stack - Development'
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
