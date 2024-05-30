"use strict";
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const randomColor = require('randomcolor');
const gameData = require('./modules/game.js');
const port = 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
-console.log(`${__dirname}/public`);
app.use(express.static(`${__dirname}/public/`));
function newBearPos(players) {
    bears = gameData.getNewBearsPos(players);
    io.emit('newBearPos', bears);
}
function newColor() {
    var color = randomColor();
    while (colors.includes(color)) {
        color = randomColor();
    }
    colors.push(color);
    return color;
}
io.on('connection', (socket) => {
    socket.on('connected', () => {
        console.log(`User ${playerNum} is connected`);
        playerNum++;
        color = newColor();
        socket.color = color;
        players[color] = { 'color': color, 'pos': [0, 0], 'chunk': [0, 0] };
        socket.emit('init', { color, tiles, players, bears });
    });
    socket.on('newPos', ({ color, pos, chunk }) => {
        players[color] = { 'color': color, 'pos': pos, 'chunk': chunk };
        io.emit('newPos', players[color]);
    });
    socket.on("disconnect", (reason) => {
        delete players[socket.color];
        delete colors[colors.indexOf(socket.color)];
        io.emit('playerDisconnect', socket.color);
    });
});
server.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
    console.log('Server is ready:');
});
