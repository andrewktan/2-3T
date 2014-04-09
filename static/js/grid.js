function Grid(parentPos) {
    this.cells = new Array();
    for (var i=0; i<9; i++) {
        this.cells[i] = new Cell(i, 
            (parentPos != null) ? null : new Grid(i), 
            parentPos);
    }
};

Grid.prototype.getTerminalGrid = function(outer) {
    if (this.cells[outer].parentPos == null)
        return this.cells[outer].contents;
};

Grid.prototype.getTerminalCell = function(outer, inner) {    
    if (this.cells[outer].contents == null)
        return null;
    else
        return this.getTerminalGrid(outer).cells[inner];

};

Grid.validWins = [[0, 1, 2], // hmm...
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
    ];

Grid.prototype.isWon = function() {
    for (validWin in Grid.validWins) {
        v = Grid.validWins[validWin]; // fix
        if (this.cells[v[0]].value != null &&
            this.cells[v[0]].value != '-' &&
            this.cells[v[0]].value == this.cells[v[1]].value &&
            this.cells[v[1]].value == this.cells[v[2]].value)
            return true;
    }
    return false;
};

Grid.prototype.isFull = function() {
    for (i=0; i<9; i++)
        if (this.cells[i].value == null &&
            i != this.parentPos)
            return false;
    return true;
};
