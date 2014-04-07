function Board() {
    this.depth = 2; // for 2-3T
    this.grid = new Grid(false);
};

Board.prototype.allowMoves = function(lastMove) {
    var board = this;

    $( '.cell[pos=' + lastMove.inner  + '] > .grid > .cell' ) // fix
        .addClass('valid')
        .bind('click', function() {
            // make move object
            move = new Move(lastMove.player,
            $( this ).parent().parent().attr('pos'), // fix
            $( this ).attr('pos'));

            // display move
            board.displayMove(move);

            // end turn
            board.freezeBoard();
            
            // new turn
            board.allowMoves(move); // this should be in Game
        });
};

Board.prototype.freezeBoard = function() {
    $( '.cell' )
        .removeClass('valid')
        .unbind('click');
};

Board.prototype.displayMove = function(move) {
    this.grid.cells[move.outer].contents.cells[move.inner].value = move.player.symbol; // fix
};
