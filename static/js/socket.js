function Socket(game) {
    this.socket = io.connect("localhost"); // configure this

    // begin a new game
    this.socket.on('new-game', function (data) {
        connections = data['connections'];
        if (connections < 3) {
            game.player = new Player(connections);
            game.message.html("You are Player " + connections);
            if (connections == 1)
                game.runGame();
        } else {
            game.player = new Player(null);
            game.message.html("You are a spectator.");
        }

    });

    // display opponent's move
    this.socket.on('push-move', function (data) {
        console.log(data);
        move = new Move(data['player'], 
            game.grid.getTerminalCell(data['outer'], data['inner']));
        game.lastMove = move;
        game.grid.displayMove(move);
        game.runGame();
    });
}

Socket.prototype.sendMove = function (move) {
    outer = move.cell.parentPos;
    inner = move.cell.pos;

    // send move to opponent
    this.socket.emit('send-move', 
        {'player': move.player, 'outer': outer, 'inner': inner});
};
