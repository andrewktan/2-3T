function Socket(game) {
    this.socket = io.connect("localhost:8080"); // configure this
    s = this;
    // begin a new game
    this.socket.on('new-connect', function (data) {
        game.player = new Player(data['pn']);
        
        game.syncBoard(data['board']);  // sync board
       
        if (data['pn'] < 3) {
            game.message.html("You are Player " + data['pn'] + ".");

            if (data['nextPlayer'] == data['pn'])
                game.allowMoves(data['board']);
        } else {
            game.message.html("You are a spectator.");
        }
    });

    // display opponent's move
    this.socket.on('push-move', function (data) {
        move = new Move(data['player'], 
            game.grid.getTerminalCell(data['outer'], data['inner']));
        game.grid.displayMove(move);

        console.log(data['nextPlayer']);
        console.log(game.player.number);
        
        if (data['nextPlayer'] == game.player.number)
            game.allowMoves(data['board']);
    });

    // game over
    this.socket.on('game-over', function (data) {
        if (data['winner'] == 0) {
            game.message.html("Tie.");
        } else {
            game.message.html("Player " + data['winner'] + " wins!");
        }
    });

    // update on other connections
    this.socket.on('opponent-connect', function (data) {
        console.log("OPP CONN");
        game.showPopup("Opponnent connected.");
    });

    this.socket.on('opponent-disconnect', function (data) {
        game.showPopup("Opponent disconnected.");
    });
}

Socket.prototype.sendMove = function (move) {
    outer = move.cell.parentPos;
    inner = move.cell.pos;

    // send move to opponent
    this.socket.emit('send-move', 
        {'player': move.player, 'outer': outer, 'inner': inner});
};
