/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 3:41 PM
 */
// Dependencies

// Local Dependencies
var db = require('../config/database').db;

// Helpers
var releaseStatuses = ['wanted', 'available', 'downloaded', 'snatched', 'ignored'];

var Release = db.define('Release', {
    guid: {
        type: String,
        index: true
    },
    title: {
        type: String
    },
    description: {
        type: String,
        'default': ''
    },
    nzbTitle: {
        type: String
    },
    providerName: {
        type: String,
        'default': ''
    },
    providerType: {
        type: String,
        'default': ''
    },
    book: {
        type: Object,
        'default': {}
    },
    grabs: {
        type: Number,
        'default': 0
    },
    review: {
        type: String,
        'default': ''
    },
    usenetDate: {
        type: String,
        'default': ''
    },
    size: {
        type: Number
    },
    link: {
        type: String
    },
    status: {
        type: String,
        'default': 'available'
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