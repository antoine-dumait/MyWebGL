"use strict";
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const port = 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
-console.log(`${__dirname}/public`);
app.use(express.static(`${__dirname}/public/`));
var playerNum = 0;
io.on('connection', (socket) => {
    socket.on('connected', () => {
        console.log(`User ${playerNum} is connected`);
        playerNum++;
        socket.emit('init', { test: "OK" });
    });
    // socket.on('newPos', ({color, pos, chunk}) =>{
    //     players[color] = {'color': color, 'pos': pos, 'chunk': chunk};
    //     io.emit('newPos', players[color]);
    // })
    // socket.on("disconnect", (reason) => {
    //     delete players[socket.color];
    //     delete colors[colors.indexOf(socket.color)];
    //     io.emit('playerDisconnect', socket.color);
    // });
});
server.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
    console.log('Server is ready:');
});
