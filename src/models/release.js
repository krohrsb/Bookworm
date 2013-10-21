/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 3:41 PM
 */
// Dependencies

// Local Dependencies
var db = require('../config/database');

// Helpers
var releaseStatuses = ['wanted', 'skipped', 'downloaded', 'snatched', 'excluded'];

var Release = db.define('Release', {
    guid: {
        type: String,
        index: true
    },
    title: {
        type: String
    },
    providerName: {
        type: String
    },
    providerType: {
        type: String
    },
    usenetDate: {
        type: String
    },
    size: {
        type: Number
    },
    link: {
        type: String
    },
    status: {
        type: String,
        'default': 'wanted'
    },
    updated: {
        type: Date
    }
});


// Validation
Release.validatesPresenceOf('guid', 'name', 'status');

Release.validatesInclusionOf('status', {
    in: releaseStatuses
});

Release.validatesUniquenessOf('guid', {
    message: 'Release GUID must bee unique.'
});

// Methods
/**
 * Retrieve a list of valid statuses for nzbs
 * @return {Array}
 */
Release.getStatuses = function () {
    'use strict';

    return releaseStatuses;
};

module.exports = Release;