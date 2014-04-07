function Player(number) {
    this.number = number; // 1 or 2
    this.symbol = (number == 1) ? ('O') : ('X');
    this.isTurn = false;
};
