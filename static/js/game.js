function Game() {
    this.depth = 2; // for 2-3T
    this.grid = new Grid(null);
    this.lastMove = null;
    this.isOver = false;
    this.message = $( '#message' );
    this.connection = new Socket(this);
};

Game.prototype.runGame = function(isReplay) {
    if (!this.isOver && !this.player.isSpectator && !isReplay)
        this.allowMoves();
};

Game.prototype.allowMoves = function() {
    game = this; // dynamic scope!
    
    outer = (game.lastMove) ? this.lastMove.cell.pos : null;

    if (outer == null || this.grid.cells[outer].contents == null) {
        for (i=0; i<9; i++) 
            for (j=0; j<9; j++) {
                cell = this.grid.getTerminalCell(i, j);
                if (cell && cell.value == null)
                    cell.jobj
                        .addClass('valid')
                        .bind('click', this.makeClickable);
            } 
    } else { 
        for (i=0; i<9; i++) {
            cell = this.grid.getTerminalCell(outer, i);
            if (cell.value == null)
               cell.jobj
                    .addClass('valid')
                    .bind('click', this.makeClickable);
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
