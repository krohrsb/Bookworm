/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 11/5/13 4:37 PM
 */

var socketIO = require('socket.io');
var logger = require('../../services/log').logger();
var bookService = require('../../services/library/book');

module.exports.initialize = function (server) {
    "use strict";
    var io = socketIO.listen(server);

    io.sockets.on('connection', function (socket) {
        //set up socket for logs
        logger.stream({start: -1}).on('log', function (log) {
            socket.emit('log', log);
        });

        bookService.on('update', function (book, changedAttributes) {
            socket.emit('book:update', book, changedAttributes);
        });

    });
};