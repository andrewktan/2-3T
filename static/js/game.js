function Game() {
    this.board = new Board();
    this.players = [new Player(1), new Player(2)];
};

Game.prototype.runGame = function() {
    this.board.allowMoves(null, [1,5]);
};

Game.prototype.isOver = function() {
    return false;
};
