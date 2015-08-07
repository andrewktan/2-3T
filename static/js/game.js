function Game() {
    this.depth = 2; // for 2-3T
    this.grid = new Grid(null);
    this.isOver = false;
    this.message = $( '#message' );
    this.connection = new Socket(this);
};

Game.prototype.syncBoard = function(board) {
    for (outer = 0; outer < 9; outer++) {
        for (inner = 0; inner < 9; inner++) {
            if (board[outer][inner] == null ||
                board[outer][inner] == 'e' ||
                board[outer][inner] == 1 && inner > 0 ||
                board[outer][inner] == 2 && inner > 0)
                continue

            if (board[outer][inner] == 1 || 
                board[outer][inner] == 2) {     // if square captured
                for (w = 0; w < 3; w++) {       // force capture
                    move = new Move(new Player(board[outer][w]), 
                        this.grid.getTerminalCell(outer, w));
                
                    this.grid.displayMove(move);
                }
            } else {
                pn = (board[outer][inner] == 'O') ? 1 : 2;
                
                move = new Move(new Player(pn), 
                   this.grid.getTerminalCell(outer, inner));
                
                this.grid.displayMove(move);
            }
        }
    }
}

Game.prototype.allowMoves = function(board) {
    if (!this.isOver && !this.player.isSpectator) {
        game = this; // dynamic scope!
        for (outer = 0; outer < 9; outer++) {
            for (inner = 0; inner < 9; inner++) {
                if (board[outer][inner] == 'e') {
                    cell = this.grid.getTerminalCell(outer, inner)
                    cell.jobj
                        .addClass('valid')
                        .bind('click', this.makeClickable);
                }
            }
        }
    }
};

Game.prototype.makeClickable = function() {
            game.lastMove = new Move(game.player,
            game.grid.getTerminalCell(
            $( this ).parent().parent().attr('pos'), // fix
            $( this ).attr('pos')
            ));

            // display move
            game.grid.displayMove(game.lastMove);

            // end turn
            game.grid.freezeBoard();

            // send move
            game.connection.sendMove(game.lastMove);
};
