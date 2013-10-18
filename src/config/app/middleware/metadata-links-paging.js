/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:00 PM
 */
var querystring = require('querystring');
module.exports = function (req, res, next) {
    'use strict';

    var offset, limit, createDynamicLink;

    createDynamicLink = function (offset, limit) {
        var pagingUrl, pagingUrlParams;

        pagingUrl = req._metadata.links.pagingRemoved.split('?')[0];
        pagingUrlParams = querystring.parse(req._metadata.links.pagingRemoved.split('?')[1]);
        pagingUrlParams.offset = offset;
        pagingUrlParams.limit = limit;

        return pagingUrl + '?' + querystring.stringify(pagingUrlParams);
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
    };

    req.query.offset = offset;
    req.query.limit = limit;

    next();
};