/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/15/13 10:35 AM
 */
module.exports = {
    queryParams: {
        maxResults: 40,
        startIndex: 0,
        langRestrict: 'en',
        printType: 'books',
        orderBy: 'newest',
        key: ''
    },
    cacheOptions: {
        maxAge: 0,
        async: true,
        length: 1,
        primitive: true
    },
    requestQueueDelay: 1500,
    requestQueueParallelCount: 1,
    pagingQueryParallelCount: 1,
    pagingQueryLimit: 5,
    apiUrl: 'https://www.googleapis.com/books/v1/volumes',
    userAgent: ''
};