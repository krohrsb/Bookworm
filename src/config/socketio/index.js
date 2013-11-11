/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 11/5/13 4:37 PM
 */

var socketIO = require('socket.io');
var logger = require('../../services/log').logger();
var bookService = require('../../services/library/book');
var releaseService = require('../../services/library/release');
var libraryService = require('../../services/library');

module.exports.initialize = function (server) {
    "use strict";
    var io = socketIO.listen(server);

    io.sockets.on('connection', function (socket) {
        //set up socket for logs
        logger.stream({start: -1, transport: 'file'}).on('log', function (log) {
            socket.emit('log', log);
        });

        bookService.on('update', function (book, changedAttributes) {
            socket.emit('book:update', book, changedAttributes);
        });

        releaseService.on('update', function (release, changedAttributes) {
            socket.emit('release:update', release, changedAttributes);
        });

        releaseService.on('create', function (release) {
            socket.emit('release:create', release);
        });

        libraryService.on('author:updatedBooks', function (author) {
            socket.emit('author:updatedBooks', author);
        });

    });
};