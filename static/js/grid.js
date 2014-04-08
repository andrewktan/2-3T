function Grid(parentPos) {
    this.cells = new Array();
    for (var i=0; i<9; i++) {
        this.cells[i] = new Cell(i, 
            (parentPos != null) ? null : new Grid(i), 
            parentPos);
    }
};
