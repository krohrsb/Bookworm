/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/11/13 4:00 PM
 */
var querystring = require('querystring');

module.exports = function (req, res, next) {
    'use strict';

    var fullUrl, params, hostPath, queryParams;

    fullUrl = req.protocol + '://' + req.get('host') + req.url;

    fullUrl = fullUrl.replace(/\?$/g, '');

    hostPath = fullUrl.split('?')[0];
    queryParams = fullUrl.split('?')[1];
    params = querystring.parse(queryParams);
    delete params.offset;
    delete params.limit;

    req._metadata = {
        links: {
            self: fullUrl,
            base: hostPath,
            pagingRemoved: (hostPath + '?' + querystring.stringify(params)).replace(/\?$/g, '')
        }
    };
    next();
};