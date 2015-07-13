'use strict';

var config = require('../../config');

var resourcesController = require('../controllers/describe-controller');

module.exports = function(app, auth) {


    app.route('/api/describe')
        .get(resourcesController.describe);

    app.route('/api/describe-properties')
        .get(resourcesController.describeProperties);

    app.route('/api/describe-outgoing-property')
        .get(resourcesController.describeOutgoingProperty);

    app.route('/api/describe-native')
        .get(resourcesController.describeNative);

    app.route('/api/describe-big')
        .get(resourcesController.describeBig);

};