/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/18/13 3:47 PM
 */
module.exports = {
    queryParams: {
        t: 'book',
        o: 'json',
        extended: 1,
        maxage: 500
    },
    cacheOptions: {
        maxAge: 0,
        async: true,
        length: 1,
        primitive: true
    },
    requestQueueDelay: 1500,
    requestQueueParallelCount: 1,
    userAgent: ''
};