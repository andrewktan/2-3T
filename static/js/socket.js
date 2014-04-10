function Socket() {
    this.socket = io.connect("localhost"); // configure this
    this.socket.on('push-move', function (data) {
           console.log(data);
    });
}

Socket.prototype.sendMove = function (move) {
    player = move.player.number;
    outer = move.cell.parentPos;
    inner = move.cell.pos;
    this.socket.emit('send-move', {'player': player, 'outer': outer, 'inner': inner});
};
