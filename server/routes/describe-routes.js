'use strict';

var config = require('../../config');

var describeController = require('../controllers/describe-controller');

module.exports = function(app, auth) {


    app.route('/api/describe')
        .get(describeController.describe);

    app.route('/api/describe-properties')
        .get(describeController.describeProperties);

    app.route('/api/describe-property-subject')
        .get(describeController.describePropertySubject);

    app.route('/api/describe-property-object')
        .get(describeController.describePropertyObject);

    app.route('/api/describe-graph')
        .get(describeController.describeGraph);

    app.route('/api/describe-raw')
        .get(describeController.describeRaw);

    app.route('/api/describe-graphs')
        .get(describeController.describeGraphs);

};