/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 11:08 AM
 */

var remoteLibraryService = require('../services/remote-library');

//noinspection JSUnusedLocalSymbols
/**
 * Queries the remote library
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function queryBooks (req, res, next) {
    'use strict';

    if (req.query.paging) {
        remoteLibraryService.pagingQuery(req.query).then(res.json.bind(res), next);
    } else {
        remoteLibraryService.query(req.query).then(res.json.bind(res), next);
    }

}

//noinspection JSUnusedLocalSymbols
/**
 * Queries the remote library given an ID
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function bookById (req, res, next) {
    'use strict';
    remoteLibraryService.findById(req.params.id, {}).then(function (book) {
        if (book) {
            res.json(book);
        } else {
            res.send(404);
        }
    }, next);
}

//noinspection JSUnusedLocalSymbols
/**
 * Queries the remote library and returns a list of authors with a relevance rating.
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
function queryAuthors (req, res, next) {
    "use strict";

    remoteLibraryService.queryAuthors(req.query).then(res.json.bind(res), next);
}


function setup (app) {
    "use strict";
    app.get('/api/v1/library/authors', queryAuthors);
    app.get('/api/v1/library/books', queryBooks);
    app.get('/api/v1/library/books/:id', bookById);
}
module.exports.setup = setup;
