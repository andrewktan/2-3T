function Grid(terminal) {
    this.cells = new Array();
    for (var i=0; i<9; i++) {
        this.cells[i] = new Cell(i, 
            (terminal)? null : new Grid(true),
            terminal);
    }
};
