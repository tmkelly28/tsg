'use strict';
const socketio = require('socket.io');
let io = null;

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function () {
        // Now have access to socket, wowzers!
    });
    
    return io;

};
