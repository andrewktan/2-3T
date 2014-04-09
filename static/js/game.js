function Game() {
    this.players = [new Player(1), new Player(2)];
    this.depth = 2; // for 2-3T
    this.grid = new Grid(null);
    this.lastMove = null;
    this.turn = 0;
    this.isOver = false;
    this.message = $( '#message' );
};

Game.prototype.runGame = function() {
    if (!this.isOver)
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
            // update message
            game.message.html("Player " + (game.turn % 2 + 1) + "'s turn.");

            // update last move
            game.lastMove = new Move(game.players[game.turn % 2], // change player
            game.grid.getTerminalCell(
            $( this ).parent().parent().attr('pos'), // fix
            $( this ).attr('pos')
            ));

            // display move
            game.displayMove();
            
            // check for winners
            gridNum = game.lastMove.cell.parentPos;
            if (game.grid.getTerminalGrid(gridNum).isWon()) { // fix
                game.grid.cells[gridNum].contents = null; // remove
                game.grid.cells[gridNum].value = game.lastMove.player.symbol;
                game.displayChange(gridNum, game.lastMove.player);
            } else if (game.grid.getTerminalGrid(gridNum).isFull()) { // fix
                game.grid.cells[gridNum].contents = null;
                game.grid.cells[gridNum].value = '-';
                game.displayChange(gridNum, null);
            }

            // end turn
            game.turn += 1;
            game.freezeBoard();
            
            // new turn
            game.runGame();
};

Game.prototype.freezeBoard = function() {
    $( '.cell' )
        .removeClass('valid')
        .unbind('click');
};

Game.prototype.displayMove = function() {
    this.lastMove.cell.value = this.lastMove.player.symbol;
    this.lastMove.cell.jobj.html(this.lastMove.cell.value);
};

Game.prototype.displayChange = function(gridNum, player) {
    lastGrid = this.grid.cells[gridNum];

    if (player != null) {
        lastGrid.jobj.html(player.symbol)
            .addClass('large-cell');
    } else {
        lastGrid.jobj.html("");
    }

    // check for game win or draw
    if (this.grid.isWon()) {
        this.message.html("Player " + player.number + " WINS!");
        this.isOver = true;
    } else if (this.grid.isFull()) {
        this.message.html("DRAW!");
        this.isOver = true;
    }
};
