function Game() {
    this.board = new Board(this);
    this.players = [new Player(1), new Player(2)];
};

Game.prototype.runGame = function() {
    this.board.allowMoves(new Move(this.players[0], 1, 1));
};

Game.prototype.isOver = function() {
    return false;
};
