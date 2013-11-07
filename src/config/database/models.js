/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/22/13 12:03 PM
 */


var Author = require('../../models/author');
var Book = require('../../models/book');
var Release = require('../../models/release');
var logger = require('../../services/log').logger();
module.exports = function (db, exists) {
    "use strict";
    Author.hasMany(Book, {
        as: 'getBooks',
        foreignKey: 'authorId'
    });

    Book.belongsTo(Author, {
        as: 'getAuthor',
        foreignKey: 'authorId'
    });

    Book.hasMany(Release, {
        as: 'getReleases',
        foreignKey: 'bookId'
    });

    Release.belongsTo(Book, {
        as: 'getBook',
        foreignKey: 'bookId'
    });

    db.isActual(function(err, actual) {
        if (err) {
            logger.err(err.message);
        } else if (!actual || !exists) {
            logger.info('Database is not up-to-date, updating schema...');
            db.autoupdate();
        }
    });
};
