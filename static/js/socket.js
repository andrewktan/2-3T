function Socket(game) {
    this.socket = io.connect("localhost:8080"); // configure this
    s = this;
    // begin a new game
    this.socket.on('new-game', function (data) {
        game.player = new Player(data['pn']);
        
        game.syncBoard(data['board']);  // sync board
       
        console.log(data['pn']); 
        if (data['pn'] < 3) {
            game.message.html("You are Player " + data['pn']);

            if (data['nextPlayer'] == data['pn'])
                game.allowMoves(data['board']);
        } else {
            game.message.html("You are a spectator.");
        }
    });

    // display opponent's move
    this.socket.on('push-move', function (data) {
        console.log(data);
        move = new Move(data['player'], 
            game.grid.getTerminalCell(data['outer'], data['inner']));
        game.grid.displayMove(move);
        game.allowMoves(data['board']);
    });

    // game over
    this.socket.on('game-over', function (data) {
        alert('game over');
    });
}

Socket.prototype.sendMove = function (move) {
    outer = move.cell.parentPos;
    inner = move.cell.pos;

    // send move to opponent
    this.socket.emit('send-move', 
        {'player': move.player, 'outer': outer, 'inner': inner});
};
