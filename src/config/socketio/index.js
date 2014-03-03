/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 11/5/13 4:37 PM
 */

var socketIO = require('socket.io');
var logger = require('../../services/log');
var db = require('../models');

module.exports.initialize = function (server) {
    "use strict";
    var io = socketIO.listen(server, {
        log: false
    });

    io.sockets.on('connection', function (socket) {
        //set up socket for logs
        logger.getInstance().on('log', function (log) {
            socket.emit('log', log);
        });

        db.emitter.on('author/afterUpdate', function (author) {
            socket.emit('author/afterUpdate', author);
        });

        db.emitter.on('book/afterUpdate', function (book) {
            socket.emit('book/afterUpdate', book);
        });

        db.emitter.on('release/afterUpdate', function (release) {
            socket.emit('release/afterUpdate', release);
        });

        db.emitter.on('release/afterCreate', function (release) {
            socket.emit('release/afterCreate', release);
        });

    });
};