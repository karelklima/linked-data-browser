'use strict';

module.exports = {
    env: 'production',
    hostname: 'http://localhost:3000',
    app: {
        name: 'LinkedData Explorer'
    },
    logging: {
        format: 'combined'
    },
    strategies: {
        local: {
            enabled: true
        }
    },
    secret: 'SOME_TOKEN_SECRET'
};