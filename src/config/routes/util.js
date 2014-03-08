/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 3/4/14 10:55 AM
 */

var _ = require('lodash');
var logger = require('../../services/log');

module.exports = {
    /**
     * Parse expand query parameter
     * @param {String} expandsList - comma delimited list of sub-objects to expand.
     * @param {Object} db - Reference to the db and its models.
     * @param {Array} [whitelist] - optional whitelist of sub-object model names.
     * @returns {Array}
     */
    parseExpand: function (expandsList, db, whitelist) {
        var list, models = [], primary, secondary, getModelName;

        getModelName = function (name) {
            return name.substring(0, 1).toUpperCase() + name.substring(1);
        };

        if (expandsList) {
            list = expandsList.split(',');
            list.forEach(function (item) {
                if (!whitelist || (whitelist.indexOf(item.toLowerCase()) !== -1)) {
                    if (item.indexOf('/') !== -1) {
                        primary = item.split('/')[0];
                        secondary = item.split('/')[1];
                        models.push({
                            model: db[getModelName(primary)],
                            include: db[getModelName(secondary)]
                        });
                    } else {
                        models.push(db[getModelName(item)]);
                    }

                }
            });
        }
        return models;
    },
    params: {
        offset: {
            name: 'offset',
            description: 'Paging offset index',
            paramType: 'query',
            dataType: 'integer',
            required: false
        },
        limit: {
            name: 'limit',
            description: 'Paging limit amount',
            paramType: 'query',
            dataType: 'integer',
            required: false
        },
        sort: {
            name: 'sort',
            description: 'Property to sort on',
            paramType: 'query',
            dataType: 'string',
            required: false
        },
        direction: {
            name: 'direction',
            description: 'When using sort, the direction in which to sort',
            paramType: 'query',
            dataType: 'string',
            enum: ['DESC', 'ASC'],
            required: false
        },
        expand: {
            name: 'expand',
            description: 'Expand an entities sub-entities. Expand an Author\'s Books, or a Book\'s Author or Releases. Comma delimited list.',
            paramType: 'query',
            dataType: 'string',
            required: false
        },
        id: {
            name: 'id',
            description: 'Entity ID',
            paramType: 'path',
            dataType: 'integer',
            required: true
        },
        Author: {
            name: 'Author',
            description: 'Author Data',
            paramType: 'body',
            dataType: 'Author',
            required: true
        },
        Book: {
            name: 'Book',
            description: 'Book Data',
            paramType: 'body',
            dataType: 'Book',
            required: true
        },
        Release: {
            name: 'Release',
            description: 'Release Data',
            paramType: 'body',
            dataType: 'Release',
            required: true
        },
        fields: {
            name: 'fields',
            description: 'List of fields to return. See https://www.npmjs.org/package/express-partial-response',
            paramType: 'query',
            dataType: 'string',
            required: false
        }
    },
    errors: {
        conflict: function (field, res) {
            var error = {
                code: 409,
                message: 'conflict with ' + field
            };
            if (res) {
                res.send(error, error.code);
            }
            return error;
        },
        invalid: function (field, res) {
            var error = {
                code: 400,
                message: 'invalid ' + field
            };
            if (res) {
                res.send(error, error.code);
            }
            return error;
        },
        notFound: function (field, res) {
            var error = {
                code: 404,
                message: field + ' not found'
            };
            if (res) {
                res.send(error, error.code);
            }
            return error;
        },
        forbidden: function (field, res) {
            var error = {
                code: 403,
                message: 'forbidden'
            };
            if (res) {
                res.send(error, error.code);
            }
            return error;
        },
        unknown: function (res) {
            var error = {
                code: 500,
                message: 'unknown server error'
            };
            if (res) {
                res.send(error, error.code);
            }
            return error;
        },
        database: function (field, dbError, res) {
            var error;
            if (_.isArray(dbError)) {
                dbError = dbError[0];
            }
            if (dbError) {
                if (typeof dbError.errno === 'number') {
                    switch (dbError.errno) {
                        case 19:
                            error = this.conflict(field);
                            break;
                        case 1:
                            error = this.invalid(field);
                            break;
                        default:
                            error = this.unknown();
                    }
                } else {
                    _.forEach(dbError, function (prop) {
                        if (!error && !_.isEmpty(prop) && _.isArray(prop)) {
                            if (prop.join(' ').indexOf('Validation') !== -1) {
                                error = this.invalid(field);
                            }
                        }
                    }.bind(this));
                }
            }
            if (!error) {
                error = this.unknown();
            }
            if (res) {
                res.send(error, error.code);
            }
            return error;
        }
    }
};