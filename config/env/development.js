'use strict';

module.exports = {
    env: 'development',
    debug: true,
    logging: {
        format: 'tiny'
    },
    aggregate: false,
    hostname: 'http://localhost:3000',
    app: {
        name: 'LinkedData Explorer [dev]'
    },
    strategies: {
        local: {
            enabled: true
        }
    },
    secret: 'SOME_TOKEN_SECRET'
};
