// local variables
var validWins = [
    [0, 1, 2], // hmm...
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
    ];
   
// exports

var emptyBoard = new Array();

for (i=0; i<9; i++) {   // generate fresh board
    emptyBoard[i] = new Array();
    for (j=0; j<9; j++)
        emptyBoard[i][j] = 'e';
}

module.exports.emptyBoard = emptyBoard;

module.exports.randomString = function(length) {
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

module.exports.isCaptured = function (board, outer) {
    for (win in validWins) {
        v = validWins[win]; // fix
        if (board[outer][v[0]] != null &&
            board[outer][v[0]] != '-' &&
            board[outer][v[0]] != 'e' &&
            board[outer][v[0]] == board[outer][v[1]] &&
            board[outer][v[1]] == board[outer][v[2]])
            return true;
    }
    return false;
}

module.exports.isWon = function (board) {
    for (win in validWins) {
        v = validWins[win]; // fix
        if (board[v[0]][0] != null &&
            board[v[0]][0] != '-' &&
            board[v[0]][0] != 'e' &&
            (board[v[0]][0] == 1 || board[v[0]][0] == 2) &&
            board[v[0]][0] == board[v[1]][0] &&
            board[v[1]][0] == board[v[2]][0])
            return true;
    }
    return false;
}

module.exports.isTie = function (board) {
    for (outer = 0; outer < 9; outer++)
        for (inner = 0; inner < 9; inner++)
            if (board[outer][inner] == null)
                return false;
    return true;
}

module.exports.isFull = function (board, outer) {
    for (inner = 0; inner < 9; inner++)
        if (board[outer][inner] == null)
            return false;
    return true;
}

module.exports.enableBlock = function (board, outer) {
    for (inner = 0; inner < 9; inner++)
        if (board[outer][inner] == null)
            board[outer][inner] = 'e';
}

module.exports.disableAll = function (board) {
    for (outer = 0; outer < 9; outer++)
        for (inner = 0; inner < 9; inner++)
            if (board[outer][inner] == 'e')
                board[outer][inner] = null;
}

module.exports.enableAll = function (board) {
    for (outer = 0; outer < 9; outer++)
        for (inner = 0; inner < 9; inner++)
            if (board[outer][inner] == null)
                board[outer][inner] = 'e';
}
