'use strict';

var config = require('../../config');

var describeController = require('../controllers/describe-controller');

module.exports = function(app, auth) {


    app.route('/api/describe')
        .get(describeController.describe);

    app.route('/api/describe-type')
        .get(describeController.describeType);

    app.route('/api/describe-properties-subject')
        .get(describeController.describePropertiesSubject);

    app.route('/api/describe-properties-object')
        .get(describeController.describePropertiesObject);

    app.route('/api/describe-property-subject')
        .get(describeController.describePropertySubject);

    app.route('/api/describe-property-object')
        .get(describeController.describePropertyObject);

    app.route('/api/describe-graph')
        .get(describeController.describeGraph);

    app.route('/api/describe-formatted')
        .get(describeController.describeFormatted);

    app.route('/api/describe-raw')
        .get(describeController.describeRaw);

    app.route('/api/describe-edit')
        .get(describeController.describeEdit);

    app.route('/api/describe-graphs')
        .get(describeController.describeGraphs);

};