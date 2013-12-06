/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/16/13 9:05 AM
 */
var pubsub = require('../pubsub');
var NotificationService = require('./notify-manager');
var NotifyMyAndroid = require('./nma');

var notificationService = new NotificationService();

notificationService.addNotifier(new NotifyMyAndroid({
    name: 'nma'
}));

pubsub.on('book:snatched', function (book) {
    "use strict";
    notificationService.notify({
        event: 'Book Snatched',
        trigger: 'snatched',
        description: book.title
    });
});

pubsub.on('book:downloaded', function (book) {
    "use strict";
    notificationService.notify({
        event: 'Book Downloaded',
        trigger: 'download',
        description: book.title
    });
});

module.exports = notificationService;