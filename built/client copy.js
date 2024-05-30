"use strict";
const socket = io();
document.addEventListener('keydown', onkeydown, false);
document.addEventListener('keyup', onkeyup, false);
document.addEventListener('mousedown', onmousedown, false);
document.addEventListener('mouseup', onmouseup, false);
let canvas = document.getElementById("canvas");
canvas.width = window.innerHeight;
canvas.height = window.innerHeight;
canvas = canvas.getContext("2d");
function draw(color, x, y, sizeX, sizeY = sizeX) {
    canvas.fillStyle = color;
    canvas.fillRect(x, y, sizeX, sizeY);
}
function drawText(text, x, y, color = 'white', size = 30, font = 'ArcadeClassic') {
    canvas.font = `${size}px ${font}`;
    canvas.fillStyle = `${color}`;
    canvas.fillText(text, x, y);
}
let board = null;
let game;
socket.emit('connected');
socket.on('init', ({ color, tiles, players, bears }) => {
    game = new Game(color, tiles, players, bears);
    socket.emit('newPos', { 'color': game.player.color, 'pos': game.player.pos, 'chunk': game.player.chunk });
    window.requestAnimationFrame(loop);
});
socket.on('newBearPos', (bears) => {
    Bear.newBearPos(bears);
});
socket.on('newPos', (playerData) => {
    var color = playerData.color;
    var pos = playerData.pos;
    var chunk = playerData.chunk;
    if (color !== game.player.color) {
        if (!Others.ids.includes(color)) {
            new Others(color, pos, chunk);
            console.log('Other created.');
        }
        else {
            Others.instances[color].changePos(pos, chunk);
        }
    }
});
socket.on('playerDisconnect', (color) => {
    Others.removePlayer(color);
    console.log(color, 'disconnected');
});
function loop(timeStamp) {
    if (game.board) {
        game.player.move(timeStamp);
        game.board.drawCentered();
        Bear.drawBears(timeStamp);
        Others.drawAllPlayers();
        game.player.drawCentered();
        game.board.drawPos();
        game.player.drawOuch();
        window.requestAnimationFrame(loop);
    }
}
class Game {
    constructor(color, tiles, players, bears) {
        this.board = new Board(tiles);
        this.player = new Player(color, this.board);
        Others.initPlayers(players);
        Bear.initBears(bears);
    }
    loop(timeStamp) {
        if (!_stop) {
            game.player.move(timeStamp);
            game.board.draw();
            game.player.draw();
            Bear.drawBears(timeStamp);
            game.board.drawPos();
            game.player.drawOuch();
            Bear.drawDistancePlayer();
            window.requestAnimationFrame(game.loop);
        }
    }
}
class Board {
    constructor(tiles) {
        this.canvas = canvas;
        this.chunkSize = 30;
        this.tileSize = window.innerHeight / this.chunkSize;
        this.chunkGenerationLimit = 5;
        this.size = this.chunkSize * this.chunkGenerationLimit;
        this.typeOfTiles = ["redSea", "water", "sand", "grass"];
        this.tilesLength = this.typeOfTiles.length;
        this.tilesProperty =
            {
                "redSea": { "color": "#722B6A" },
                "water": { "color": "#3434f9" },
                "sand": { "color": "#c2b280" },
                "grass": { "color": "#259618" }
            };
        this.tiles = tiles; //array of chunks 
    }
    draw() {
        for (let i = 0; i < this.chunkSize; i++) {
            for (let j = 0; j < this.chunkSize; j++) {
                try {
                    draw(this.tilesProperty[this.tiles[game.player.chunk[1]][game.player.chunk[0]][i][j]].color, j * this.tileSize, i * this.tileSize, this.tileSize);
                }
                catch (TypeError) {
                    console.error(`x:${i}, y:${j}, erreur de dessin.`);
                    console.log(this.tiles);
                }
            }
        }
    }
    drawCentered() {
        var absPos = [game.player.chunk[0] * this.chunkSize + game.player.pos[0], game.player.chunk[1] * this.chunkSize + game.player.pos[1]];
        for (let i = 0; i < this.chunkSize; i++) {
            for (let j = 0; j < this.chunkSize; j++) {
                //Math.floor(absPos[0]/this.chunkSize) 
                try {
                    draw(this.tilesProperty[this.tiles[Math.floor((absPos[1] + j) / this.chunkSize)][Math.floor((absPos[0] + i) / this.chunkSize)][(absPos[0] + j) % this.chunkSize][(absPos[0] + i) % this.chunkSize]].color, j * this.tileSize, i * this.tileSize, this.tileSize);
                }
                catch (TypeError) {
                    console.error(`x:${i}, y:${j}, erreur de dessin.`);
                    console.log(this.tiles);
                }
            }
        }
    }
    drawPos() {
        drawText(`X:${game.player.chunk[0]} Y:${game.player.chunk[1]}`, '20', '40');
        drawText(`X:${game.player.pos[0]} Y:${game.player.pos[1]}`, '20', '80');
        drawText(`Live:${game.player.live}`, '20', '120');
    }
}
class Others {
    static instances = {};
    static ids = [];
    static drawAllPlayers() {
        for (let i = 0; i < this.ids.length; i++) {
            var id = this.ids[i];
            var player = this.instances[id];
            if (this.instances[id].chunk[0] === game.player.chunk[0] && this.instances[id].chunk[1] === game.player.chunk[1]) {
                canvas.fillStyle = player.color;
                canvas.fillRect(player.pos[0] * game.board.tileSize, player.pos[1] * game.board.tileSize, game.board.tileSize, game.board.tileSize);
            }
        }
    }
    static initPlayers(players) {
        var playersColors = Object.keys(players);
        for (let i = 0; i < playersColors.length; i++) {
            var player = players[playersColors[i]];
            new Others(player.color, player.pos, player.chunk);
        }
    }
    static removePlayer(color) {
        this.ids.splice(this.ids.indexOf(color), 1);
        delete this.instances[color];
    }
    constructor(color, pos, chunk) {
        this.color = color;
        this.pos = pos;
        this.chunk = chunk;
        this.constructor.instances[this.color] = this;
        this.constructor.ids.push(color);
        console.log('other: ', this.color = color, this.pos = pos, this.chunk = chunk);
        console.log(Others.instances);
    }
    changePos(pos, chunk) {
        this.pos = [pos[0], pos[1]];
        this.chunk = [chunk[0], chunk[1]];
    }
}
class Player {
    constructor(color, board) {
        this.board = board;
        this.chunk = [Math.floor(board.chunkGenerationLimit / 2), Math.floor(board.chunkGenerationLimit / 2)];
        this.color = color;
        this.moveInterval = 100;
        this.timeOfLastMove = 0;
        this.firstMove = false;
        this.controller = new InputController();
        this.moveTime = {
            x: 0,
            y: 0
        };
        this.live = 5;
        this.movableTiles = ["grass", "sand"]; //by order of preferences
        this.pos = this.startPos();
        //this.instances.push(this);
    }
    startPos() {
        var pos = [4, 4];
        if (this.movableTiles.includes(this.board.tiles[this.chunk[1]][this.chunk[0]][pos[1]][pos[0]])) {
            return pos;
        }
        else {
            for (let i = 0; i < this.movableTiles.length; i++) {
                if (this.board.tiles[this.chunk[1]][this.chunk[0]][pos[1]].includes(this.movableTiles[i])) {
                    return [this.board.tiles[this.chunk[1]][this.chunk[0]][pos[1]].indexOf(this.movableTiles[i]), pos[1]];
                }
            }
            for (let j = 0; j < this.board.chunkSize; j++) {
                for (let i = 0; i < this.movableTiles.length; i++) {
                    if (this.board.tiles[this.chunk[1]][this.chunk[0]][j].includes(this.movableTiles[i])) {
                        return [this.board.tiles[this.chunk[1]][this.chunk[0]][j].indexOf(this.movableTiles[i]), j];
                    }
                }
            }
            return pos;
        }
    }
    findNextPos(pos, deltaPos, chunk) {
        var nextChunk = [];
        nextChunk[0] = chunk[0];
        nextChunk[1] = chunk[1];
        var nextPos = [pos[0] + deltaPos[0], pos[1] + deltaPos[1]];
        if (nextPos[0] >= game.board.chunkSize) {
            nextPos[0] = 0;
            nextChunk[0]++;
        }
        else if (nextPos[0] <= -1) {
            nextPos[0] = game.board.chunkSize - 1;
            nextChunk[0]--;
        }
        if (nextPos[1] >= game.board.chunkSize) {
            nextPos[1] = 0;
            nextChunk[1]++;
        }
        else if (nextPos[1] <= -1) {
            nextPos[1] = game.board.chunkSize - 1;
            nextChunk[1]--;
        }
        if (nextChunk[0] <= -1) {
            nextChunk[0] = 0;
        }
        else if (nextChunk[0] >= game.board.chunkGenerationLimit) {
            nextChunk[0] = game.board.chunkGenerationLimit - 1;
        }
        if (nextChunk[1] <= -1) {
            nextChunk[1] = 0;
        }
        else if (nextChunk[1] >= game.board.chunkGenerationLimit) {
            nextChunk[1] = game.board.chunkGenerationLimit - 1;
        }
        return [nextPos, nextChunk];
    }
    isMovable(nextPos, nextChunk) {
        if (this.movableTiles.includes(game.board.tiles[nextChunk[1]][nextChunk[0]][nextPos[1]][nextPos[0]])) {
            return true;
        }
        return false;
    }
    move(timeStamp) {
        var deltaPos = this.controller.updatePosition();
        var posChunkArray = this.findNextPos(this.pos, deltaPos, this.chunk);
        this.nextPos = posChunkArray[0];
        this.nextChunk = posChunkArray[1];
        var newPos = false;
        if (this.isMovable(this.nextPos, this.nextChunk)) {
            if (deltaPos[0] !== 0 && this.moveTime.x + this.moveInterval <= timeStamp) {
                this.pos[0] = this.nextPos[0];
                this.chunk[0] = this.nextChunk[0];
                this.moveTime.x = timeStamp;
                newPos = true;
            }
            if (deltaPos[1] !== 0 && this.moveTime.y + this.moveInterval <= timeStamp) {
                this.pos[1] = this.nextPos[1];
                this.chunk[1] = this.nextChunk[1];
                this.moveTime.y = timeStamp;
                newPos = true;
            }
        }
        if (newPos) {
            socket.emit('newPos', { color: this.color, pos: this.pos, chunk: this.chunk });
        }
    }
    draw() {
        canvas.fillStyle = this.color;
        canvas.fillRect(this.pos[0] * game.board.tileSize, this.pos[1] * game.board.tileSize, game.board.tileSize, game.board.tileSize);
    }
    drawCentered() {
        canvas.fillStyle = this.color;
        canvas.fillRect(Math.floor(game.board.chunkSize / 2) * game.board.tileSize, Math.floor(game.board.chunkSize / 2) * game.board.tileSize, game.board.tileSize, game.board.tileSize);
    }
    drawOuch() {
        if (!this.isMovable(this.nextPos, this.nextChunk)) {
            var font = 20;
            var ouch = 'Ouch';
            canvas.font = `${font}px ArcadeClassic`;
            canvas.fillStyle = 'red';
            canvas.fillText(ouch, this.pos[0] * this.board.tileSize - this.board.tileSize / 2 + 6, this.pos[1] * this.board.tileSize - this.board.tileSize / 10);
        }
    }
}
class Bear {
    static instances = [];
    static reset() {
        this.instances = [];
    }
    static initBears(bears) {
        var bearLen = bears.length;
        for (let i = 0; i < bearLen; i++) {
            var bear = bears[i];
            new Bear(bear.pos, bear.chunk, bear.timeOfLastMove);
        }
    }
    static newBearPos(bears) {
        var bearLen = this.instances.length;
        for (let i = 0; i < bearLen; i++) {
            var nextBear = bears[i];
            this.instances[i].nextPos = nextBear.pos;
            this.instances[i].nextChunk = nextBear.chunk;
        }
    }
    static drawBears(timeStamp) {
        for (let i = 0; i < this.instances.length; i++) {
            this.instances[i].move(timeStamp);
            this.instances[i].distancePlayerFind(game.player);
            if (this.instances[i].chunk[0] === game.player.chunk[0] && this.instances[i].chunk[1] === game.player.chunk[1]) {
                this.instances[i].draw();
            }
        }
    }
    static closestToPlayer = null;
    static color = "#653818";
    static drawDistancePlayer() {
        if (Bear.closestToPlayer !== null) {
            var font = 30;
            canvas.font = `${font}px ArcadeClassic`;
            canvas.strokeStyle = 'white';
            canvas.fillText(`Bear:${Math.floor(Bear.closestToPlayer.distancePlayer)}m`, '20', '160');
        }
        else {
            var font = 30;
            canvas.font = `${font}px ArcadeClassic`;
            canvas.strokeStyle = 'white';
            canvas.fillText(`Bear:none`, '20', '160');
        }
    }
    constructor(pos, chunk, timeOfLastMove) {
        this.pos = pos;
        this.chunk = chunk;
        this.nextPos = [0, 0];
        this.nextChunk = [0, 0];
        this.moveInterval = 600;
        this.timeOfLastMove = 0;
        this.randomInterval = timeOfLastMove;
        this.prevMove = this.pos;
        this.nextMove = [0, 0];
        Bear.instances.push(this);
        this.distancePlayer = 666;
        if (Bear.closestToPlayer === null) {
            Bear.closestToPlayer = this;
        }
    }
    distancePlayerFind(entity) {
        var dist = Math.sqrt(((entity.chunk[0] - this.chunk[0]) * game.board.chunkSize + entity.pos[0] - this.pos[0]) ** 2 + ((entity.chunk[1] - this.chunk[1]) * game.board.chunkSize + entity.pos[1] - this.pos[1]) ** 2);
        this.distancePlayer = dist;
        if (this.distancePlayer < Bear.closestToPlayer.distancePlayer) {
            Bear.closestToPlayer = this;
        }
    }
    move(timeStamp) {
        if (this.timeOfLastMove + this.moveInterval < timeStamp) {
            this.pos = [this.nextPos[0], this.nextPos[1]];
            this.chunk = [this.nextChunk[0], this.nextChunk[1]];
            if (this.chunk[0] === game.player.chunk[0] && this.chunk[1] === game.player.chunk[1] &&
                this.pos[0] === game.player.pos[0] && this.pos[1] === game.player.pos[1]) {
                game.player.live--;
            }
            this.timeOfLastMove = timeStamp - this.randomInterval;
        }
    }
    draw() {
        canvas.fillStyle = this.constructor.color;
        canvas.fillRect(this.pos[0] * game.board.tileSize, this.pos[1] * game.board.tileSize, game.board.tileSize, game.board.tileSize);
    }
}
class InputController {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.keyPressed = {
            left: false,
            up: false,
            right: false,
            down: false
        };
        this.bindKeys();
        this.intervalId = null;
    }
    bindKeys() {
        document.addEventListener("keydown", event => {
            switch (event.key) {
                case "ArrowLeft": // left arrow
                    this.keyPressed.left = true;
                    break;
                case "ArrowUp": // up arrow
                    this.keyPressed.up = true;
                    break;
                case "ArrowRight": // right arrow
                    this.keyPressed.right = true;
                    break;
                case "ArrowDown": // down arrow
                    this.keyPressed.down = true;
                    break;
                case " ": // down arrow
                    _stop = true;
                    console.log('stop');
                    break;
            }
        });
        document.addEventListener("keyup", event => {
            switch (event.key) {
                case "ArrowLeft": // left arrow
                    this.keyPressed.left = false;
                    break;
                case "ArrowUp": // up arrow
                    this.keyPressed.up = false;
                    break;
                case "ArrowRight": // right arrow
                    this.keyPressed.right = false;
                    break;
                case "ArrowDown": // down arrow
                    this.keyPressed.down = false;
                    break;
            }
        });
    }
    updatePosition() {
        let x = 0;
        let y = 0;
        if (this.keyPressed.left)
            x -= 1;
        if (this.keyPressed.up)
            y -= 1;
        if (this.keyPressed.right)
            x += 1;
        if (this.keyPressed.down)
            y += 1;
        return [x, y];
    }
}
