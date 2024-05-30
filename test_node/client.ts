const socket = io();

socket.emit('connected');

socket.on('init', ({test}) =>{
    console.log(test);
    
});
