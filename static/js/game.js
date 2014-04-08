function Game() {
    this.players = [new Player(1), new Player(2)];
    this.depth = 2; // for 2-3T
    this.grid = new Grid(null);
    this.lastMove = new Move(this.players[0], this.grid.getTerminal(1,1));
    this.turn = 0;
};

Game.prototype.runGame = function() {
    if (!this.isOver())
        this.allowMoves();
};

Game.prototype.allowMoves = function() {
    game = this; // dynamic scope!
    
    for (i=0; i<9; i++) {
        cell = this.grid.getTerminal(this.lastMove.cell.pos, i);
        if (cell.value == null)
            cell.jobj
                .addClass('valid')
                .bind('click', this.makeClickable);
    }
};

Game.prototype.makeClickable = function() {
            // update last move
            game.lastMove = new Move(game.players[game.turn % 2], // change player
            game.grid.getTerminal(
            $( this ).parent().parent().attr('pos'), // fix
            $( this ).attr('pos')
            ));

            // display move
            game.displayMove();

            // end turn
            game.turn += 1;
            game.freezeBoard();
            
            // new turn
            game.runGame();

        }

Game.prototype.freezeBoard = function() {
    $( '.cell' )
        .removeClass('valid')
        .unbind('click');
};

Game.prototype.displayMove = function() {
    this.lastMove.cell.value = this.lastMove.player.symbol;
    this.lastMove.cell.jobj.html(this.lastMove.cell.value);
};


Game.prototype.isOver = function() {
    return false;
};
