function Board() {
    this.depth = 2; // for 2-3T
    this.grid = new Grid(false);
};

Board.prototype.allowMoves = function(player, lastMove) {
    $( '.cell[pos=' + lastMove[0]  + '] > .grid > .cell' )
        .addClass('valid');
};
