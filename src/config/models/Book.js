var libxmljs = require('libxmljs');
var logger = require('../../services/log').logger();
var Q = require('q');
var _ = require('lodash');

/**
 * Book DB Model
 * @param {object} sequelize - sequelize instance
 * @param {object} DataTypes - data types reference
 * @returns {Book}
 */
module.exports = function(sequelize, DataTypes) {
    var Book = sequelize.define('Book', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guid: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
            onDelete: 'cascade'
        },
        title: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        authorName: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        publisher: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        averageRating: {
            type: DataTypes.FLOAT,
            defaultValue: '',
            allowNull: false
        },
        pageCount: {
            type: DataTypes.INTEGER,
            defaultValue: '',
            allowNull: false
        },
        language: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        apiLink: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        isbn: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        image: {
            type: DataTypes.TEXT,
            defaultValue: '/img/no-image.gif',
            allowNull: false
        },
        imageSmall: {
            type: DataTypes.TEXT,
            defaultValue: '/img/no-image.gif',
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('wanted', 'wanted_new', 'skipped', 'downloaded', 'snatched', 'excluded'),
            defaultValue: 'skipped'
        },
        provider: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        published: {
            type: DataTypes.DATE
        }
    }, {
        classMethods: {
            /**
             * Associate books with other models
             * @param {object} models - Reference to other models
             */
            associate: function(models) {
                Book.belongsTo(models.Author);
                Book.hasMany(models.Release);
            },
            /**
             * Initialize hooks for this model
             * @param {object} models - Reference to other models, includes model emitter.
             */
            hooks: function (models) {
                "use strict";
                Book.hook('afterUpdate', function (book, next) {
                    models.emitter.emit('book/afterUpdate', book);
                    next(null, book);
                });
                Book.hook('beforeUpdate', function (newBook, next) {
                    this.find({
                        where: {
                            id: newBook.id
                        }
                    }).then(function (oldBook) {
                        if (newBook.status === 'snatched' && newBook.status !== oldBook.status) {
                            models.emitter.emit('book/snatched', newBook);
                        }
                        if (newBook.status === 'downloaded' && newBook.status !== oldBook.status) {
                            models.emitter.emit('book/downloaded', newBook);
                        }
                        if (newBook.status !== oldBook.status) {
                            models.emitter.emit('book/statusUpdated', newBook);
                        }
                        next(null, newBook);
                    }, next);
                });
            },
            /**
             * Merge two collections of books
             * @param {object} author - the author object associated with these books
             * @param {array} localBooks - the set of books currently for this author
             * @param {array} remoteBooks - the set of books gathered for this author to merge in
             * @param {boolean} mergeData - determines if we also try and match/merge book data rather than just the books themselves.
             * @returns {Promise}
             */
            merge: function (author, localBooks, remoteBooks, mergeData) {
                "use strict";
                var validMergeAttributesMask = 'published,imageSmall,image,apiLink,isbn,provider,language,publisher,pageCount,description,link,title';
                if (_.isArray(localBooks) && _.isArray(remoteBooks)) {
                    logger.log('debug', 'Merging books together', {localCount: localBooks.length, remoteCount: remoteBooks.length, mergeData: mergeData});
                    return Q.fcall(function () {
                        if (mergeData) {
                            return Q.all(localBooks.map(function (localBook) {
                                var duplicateRemoteBook;
                                duplicateRemoteBook = _.find(remoteBooks, function (remoteBook) {
                                    return localBook.guid === remoteBook.guid;
                                });
                                if (duplicateRemoteBook) {
                                    return localBook.updateAttributes(duplicateRemoteBook.values, validMergeAttributesMask.split(','));
                                } else {
                                    return localBook;
                                }

                            }.bind(this)));
                        } else {
                            return localBooks;
                        }
                    }.bind(this)).then(function (destination) {
                        return _.reject(remoteBooks, function (sourceBook) {
                            return _.any(destination, function (destinationBook) {
                                return (sourceBook.guid === destinationBook.guid || sourceBook.title === destinationBook.title);
                            });
                        });
                    }).then(function (newBooks) {
                        return Q.all(newBooks.map(function (book) {
                            return Book.create(book);
                        }));
                    }).then(function (newBooks) {
                        return Q.all(newBooks.map(function (book) {
                            book.setAuthor(author);
                        }));
                    }.bind(this)).then(function (savedBooks) {
                        logger.log('debug', 'Finished merging books for author', {author: author.name, mergedBookData: mergeData});
                        logger.log('debug', 'New books saved', {count: savedBooks.length});
                        return savedBooks.concat(localBooks);
                    });
                } else {
                    return Q.fcall(function () {
                        throw new Error('Source/localBooks not an array');
                    });
                }
            }
        },
        instanceMethods: {
            /**
             * Determines if the book is in a wanted state.
             * @returns {boolean}
             */
            isWanted: function () {
                "use strict";
                return this.status === 'wanted' || this.status === 'wanted_new';
            },
            /**
             * Retrieves the books OPF XML
             * @returns {Promise}
             */
            getOpf: function () {
                "use strict";
                var doc, ref;
                doc = new libxmljs.Document();
                ref = doc.node('package').attr({xmlns: 'http://www.idpf.org/2007/opf'})
                    .node('metadata').attr({'xmlns:dc': 'http://purl.org/dc/elements/1.1/', 'xmlns:opf': 'http://www.idpf.org/2007/opf'})
                    .node('dc:title', this.title).parent()
                    .node('dc:creator', this.authorName).attr({'opf:role': 'aut'}).parent()
                    .node('dc:language', this.language).parent()
                    .node('dc:identifier', this.guid).attr({'opf:scheme': this.provider}).parent();
                if (!_.isEmpty(this.isbn)) {
                    ref = ref.node('dc:identifier', this.isbn).attr({'opf:scheme': 'ISBN'}).parent();
                }
                if (!_.isEmpty(this.publisher)) {
                    ref = ref.node('dc:publisher', this.publisher).parent();
                }
                if (!_.isEmpty(this.published)) {
                    ref = ref.node('dc:date', this.published).parent();
                }
                if (!_.isEmpty(this.description)) {
                    ref = ref.node('dc:description', this.description).parent();
                }
                ref.node('guide')
                    .node('reference').attr({href: 'cover.jpg', type: 'cover', title: 'Cover'});
                //noinspection JSHint
                return Q(doc.toString());
            }
        }
    });

    return Book;
};