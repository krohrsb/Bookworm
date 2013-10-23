/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 3:10 PM
 */
// Dependencies
var Schema = require('jugglingdb').Schema;

// Local Dependencies
var db = require('../config/database').db;

// Helpers
var authorStatuses = ['paused', 'active'];

var Author = db.define('Author', {
    guid: {
        type: String,
        index: true
    },
    name: String,
    description: {
        type: Schema.Text,
        'default': ''
    },
    link: {
        type: String,
        'default': ''
    },
    books: {
        type: Object,
        'default': []
    },
    latestBook: {
        type: Object,
        default: {}
    },
    apiLink: {
        type: String,
        'default': ''
    },
    image: {
        type: String,
        "default": '/img/no-image.gif'
    },
    imageSmall: {
        type: String,
        "default": '/img/no-image.gif'
    },
    status: {
        type: String,
        'default': authorStatuses[1]
    },
    relevance: {
        type: Number,
        'default': 0
    },
    provider: String
});


// Validation
Author.validatesPresenceOf('guid', 'name', 'status');
Author.validatesInclusionOf('status', {
    in: authorStatuses
});
Author.validatesUniquenessOf('guid', {
    message: 'Author GUID must bee unique.'
});

module.exports = Author;