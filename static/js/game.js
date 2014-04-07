function Game() {
    this.players = [new Player(1), new Player(2)];
    this.depth = 2; // for 2-3T
    this.grid = new Grid(false);
    this.lastMove = new Move(this.players[0], 1, 1);
};

Game.prototype.runGame = function() {
    if (!this.isOver())
        this.allowMoves();
};

Game.prototype.allowMoves = function() {
    var game = this;

    $( '.cell[pos=' + this.lastMove.inner  + '] > .grid > .cell' ) // fix
        .addClass('valid')
        .bind('click', function() {
            // make move object
            game.lastMove = new Move(game.players[0], // change player
            $( this ).parent().parent().attr('pos'), // fix
            $( this ).attr('pos'));

            // display move
            game.displayMove(game.lastMove);

            // end turn
            game.freezeBoard();
            
            // new turn
            game.runGame();

        });
};

Game.prototype.freezeBoard = function() {
    $( '.cell' )
        .removeClass('valid')
        .unbind('click');
};

Game.prototype.displayMove = function() {
    this.grid.cells[this.lastMove.outer].contents.cells[this.lastMove.inner].value = this.lastMove.player.symbol; // fix
};


Game.prototype.isOver = function() {
    return false;
};
