function Player(number) {
    this.number = number; // 0 or 1
    this.symbol = (number == 1) ? ('O') : ('X');
    this.isTurn = number == 0;
    this.isSpectator = (number == null);
};
