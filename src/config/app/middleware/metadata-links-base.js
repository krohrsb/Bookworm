/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:00 PM
 */
var qs = require('querystring');

/**
 * Request Metadata links generation.
 * @param {object} req - The Request object.
 * @param {object} res - The Response object.
 * @param {function} next - callback to next middleware
 */
module.exports = function (req, res, next) {
    'use strict';

    var fullUrl, params, hostPath, queryParams;

    fullUrl = req.protocol + '://' + req.get('host') + req.url;

    fullUrl = fullUrl.replace(/\?$/g, '');

    hostPath = fullUrl.split('?')[0];

    queryParams = fullUrl.split('?')[1];

    params = qs.parse(queryParams);

    delete params.offset;
    delete params.limit;

    req._metadata = {
        links: {
            self: fullUrl,
            base: hostPath,
            pagingRemoved: (hostPath + '?' + qs.stringify(params)).replace(/\?$/g, '')
        }
    };
    next();
};