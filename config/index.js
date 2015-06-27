var fs = require('fs');
var _ = require('lodash');

var configPath = __dirname + '/env';

// Sets the default 'development' value of NODE_ENV variable
process.env.NODE_ENV = ~fs.readdirSync(configPath).map(function(file) {
    return file.slice(0, -3);
}).indexOf(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

// Extend ./env/all.js with particular configuration based on current environment,
// for example ./env/development.js
module.exports = _.extend(
    require(configPath + '/all'),
    require(configPath + '/' + process.env.NODE_ENV) || {}
);
