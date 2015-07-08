var _ = require('lodash');

function Toaster() {

    var toasts = [];

    function addToast(type, message) {
        toasts.push({
            message: message,
            type: type
        })
    }

    this.info = addToast.bind(null, 'info');
    this.error = addToast.bind(null, 'error');
    this.success = addToast.bind(null, 'success');
    this.warning = addToast.bind(null, 'warning');

    this.importValidationErrors = function (errors) {
        if (_.isArray(errors)) {
            _.forEach(errors, function (error) {
                addToast('error', error.msg);
            });
        }
    };

    this.size = function() {
        return toasts.length;
    };

    this.getToasts = function() {
        return toasts;
    };

    this.toJSON = function() {
        return {
            "toasts": toasts
        };
    }
}

module.exports = Toaster;