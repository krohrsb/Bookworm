/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:00 PM
 */
var qs = require('querystring');

/**
 * Request Metadata Paging information.
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
module.exports = function (req, res, next) {
    'use strict';

    var offset, limit, createDynamicLink;

    /**
     * Create a dynamic link given offset and limit
     * @param {number} offset - offset number
     * @param {number} limit - limit number
     * @returns {string} the full url with proper params.
     */
    createDynamicLink = function (offset, limit) {
        var pagingUrl, pagingUrlParams;

        pagingUrl = req._metadata.links.pagingRemoved.split('?')[0];
        pagingUrlParams = qs.parse(req._metadata.links.pagingRemoved.split('?')[1]);
        pagingUrlParams.offset = offset;
        pagingUrlParams.limit = limit;

        return pagingUrl + '?' + qs.stringify(pagingUrlParams);
    };

    offset = req.query.offset;
    limit = req.query.limit;

    offset = parseInt(offset, 10);
    limit = parseInt(limit, 10);


    if (isNaN(offset)) {
        offset = 0;
    }
    if (isNaN(limit)) {
        limit = 10;
    }

    req.setPaging = function (totalRecords) {
        var previous, next, last, ensureNotNegative;

        ensureNotNegative = function (num) {
            return (num < 0) ? 0 : num;
        };

        previous = ensureNotNegative(offset - limit);
        next = ensureNotNegative((offset + limit > totalRecords) ? (totalRecords - offset) - limit : offset + limit);
        last = ensureNotNegative((totalRecords - offset) - limit);

        req._metadata.links.first = createDynamicLink(0, limit);
        req._metadata.links.previus = createDynamicLink(previous, limit);
        req._metadata.links.next = createDynamicLink(next, limit);
        req._metadata.links.last = createDynamicLink(last, limit);
        req._metadata.total = totalRecords;
        req._metadata.offset = offset;
        req._metadata.limit = limit;
    };
    // only place the new value in the query object if it was defined before.
    if (typeof req.query.offset !== 'undefined') {
        req.query.offset = offset;
    }
    if (typeof req.query.limit !== 'undefined') {
        req.query.limit = limit;
    }
    next();
};