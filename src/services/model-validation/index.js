/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/17/13 3:31 PM
 */

// Dependencies
var events = require('events');
var util = require('util');
var Q = require('q');
var _ = require('lodash');
/**
 * Model Validation Service. Provides methods to handle model validation, determining error type etc.
 * @constructor
 */
var ModelValidationService = function () {
    "use strict";

    this._messages = {
        'uniqueness': 'Entity is not unique/already exists',
        'uniqueness.empty': 'Entity key cannot be unique',
        'presence': 'Entity is missing a required property',
        'other': 'Entity has a general validation error'
    };

    this._statusCodes = {
        'uniqueness': 409,
        'uniqueness.empty': 400,
        'presence': 400,
        'other': 400
    };


    events.EventEmitter.call(this);
};

util.inherits(ModelValidationService, events.EventEmitter);

/**
 * Retrieve all violations in an array for the error.
 * @param {Error} err - Error with codes property from a model validation error.
 * @returns {Promise} A promise of type Promise<String[], Error>
 * @private
 */
ModelValidationService.prototype._getAllViolations = function (err) {
    "use strict";
    var violations = [], prop;

    if (err && err.codes) {
        for (prop in err.codes) {
            if (err.codes.hasOwnProperty(prop)) {
                violations = violations.concat(err.codes[prop]);
            }
        }
    }

    //noinspection JSHint
    return Q(violations);
};


/**
 * Retrieve the highest numbered status code from one or more errors.
 * @param {Error|Error[]} err - one or more errors
 * @returns {Promise} A promise of type Promise<Number, Error>
 */
ModelValidationService.prototype.getStatusCode = function (err) {
    "use strict";
    var code = 0;
    if (_.isUndefined(err)) {
        err = [];
    }
    if (!_.isArray(err)) {
        err = [err];
    }
    err.forEach(function (err) {
        if (err.statusCode && err.statusCode > code) {
            code = err.statusCode;
        }
    });
    //noinspection JSHint
    return Q(code);
};
/**
 * Format one or more errors into one error containing a human readable message and a corresponding status code.
 * @param {Error[]|Error} err - An error object or an array of error objects
 * @returns {Promise} A promise of type Promise<Error, Error>
 */
ModelValidationService.prototype.formatError = function (err) {
    "use strict";
    var errors;
    if (!_.isArray(err)) {
        errors = [err];
    } else {
        errors = err;
    }

    return this.getStatusCode(errors).then(function (code) {
        return Q.all(errors.map(this._getAllViolations.bind(this)))
        .then(function (violations) {
            var err, violation, message;
            violations = _.flatten(violations);
            violations = _.uniq(violations);
            violation = violations[0];
            if (!violation) {
                message = errors[0].message;
            }
            err = new Error(this._messages[violation] || message || this._messages.other);
            err.statusCode = code || this._statusCodes[violation] || this._statusCodes.other;
            err.violations = violations;
            return err;
        }.bind(this));
    }.bind(this));



};

module.exports = ModelValidationService;