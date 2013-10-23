/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 3:41 PM
 */
// Dependencies

// Local Dependencies
var db = require('../config/database').db;

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
    nzbTitle: {
        type: String
    },
    providerName: {
        type: String
    },
    providerType: {
        type: String
    },
    book: {
        type: Object,
        'default': {}
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
    },
    directory: {
        type: String,
        'default': ''
    }
});


// Validation
Release.validatesPresenceOf('guid', 'title', 'status');

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