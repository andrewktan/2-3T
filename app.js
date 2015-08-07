var
http = require('http'),
path = require('path'),
fs = require('fs'),
swig = require('swig'),
socket = require('socket.io'),
deleteKey = require('key-del');

var domain = 'localhost:8080';  // change this

var room, ongoing = {}, emptyBoard = new Array(); // refactor

// function defs
function randomString(length) {
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// route

var server = http.createServer(function(req, res) {
    var
    content = '',
    fileName = path.basename(req.url),
    pathName = path.dirname(req.url),
    localFolder = __dirname;
   
    // serve static files 
    if (path.dirname(pathName) == '/static') {
        content = localFolder + req.url;
        fs.readFile(content, function(err, contents) {
            if(!err) {
                // write proper header
                if (path.basename(pathName) == 'css')
                    res.writeHead(200, {'Content-Type': 'text/css'});
                else if (path.basename(pathName) == 'js')
                    res.writeHead(200, {'Content-Type': 'text/javascript'});
                // write contents 
                res.end(contents);
            } else {
                console.dir(err);
            }
       });
    } else if (fileName == 'favicon.ico') {
    } else if (fileName == '' && pathName == '/'){  // serve intro page
        res.writeHead(200, {'Content-Type': 'text/html'});
        tpl = swig.compileFile('templates/index.html');
        res.write(tpl({
            'quickroom': randomString(6), 
                'rooms': Object.keys(ongoing),
                'domain': domain
                }));

        res.end();
    } else if (pathName == '/') {    // serve board page
        room = fileName; // temporary
        res.writeHead(200, {'Content-Type': 'text/html'});
        tpl = swig.compileFile('templates/gameboard.html');
        res.write(tpl());
        res.end();
	} else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write(':(');
        res.end();
    }
});

// generate fresh board
for (i=0; i<9; i++) {
    emptyBoard[i] = new Array();
    for (j=0; j<9; j++)
        emptyBoard[i][j] = 'e';
}

// win check function
validWins = [
    [0, 1, 2], // hmm...
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
    ];

function isCaptured(board, outer) {
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

function isWon(board) {
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

function isTie(board) {
    for (outer = 0; outer < 9; outer++)
        for (inner = 0; inner < 9; inner++)
            if (board[outer][inner] == null)
                return false;
    return true;
}

function isFull(board, outer) {
    for (inner = 0; inner < 9; inner++)
        if (board[outer][inner] == null)
            return false;
    return true;
}

function enableBlock(board, outer) {
    for (inner = 0; inner < 9; inner++)
        if (board[outer][inner] == null)
            board[outer][inner] = 'e';
}

function disableAll(board) {
    for (outer = 0; outer < 9; outer++)
        for (inner = 0; inner < 9; inner++)
            if (board[outer][inner] == 'e')
                board[outer][inner] = null;
}

function enableAll(board) {
    for (outer = 0; outer < 9; outer++)
        for (inner = 0; inner < 9; inner++)
            if (board[outer][inner] == null)
                board[outer][inner] = 'e';
}
// sockets
var io = socket.listen(server);

io.sockets.on('connection', function(client) {
    // connect to room
    client.room = room;
    client.join(client.room);

    // initialize game
    client_list = io.sockets.adapter.rooms[client.room];
    client_list_length = Object.keys(client_list).length;
   
    // initialize room 
    if (!(client.room in ongoing)) {
        ongoing[client.room] = {};
        ongoing[client.room]['player1'] = client.id;
        ongoing[client.room]['player2'] = false;
        ongoing[client.room]['spectators'] = 0;
        ongoing[client.room]['nextMove'] = 1;
        ongoing[client.room]['board'] = JSON.parse(JSON.stringify(emptyBoard));    // feels dirty
        client.pn = 1;
    
        console.log('[NEW] room: ' + client.room + ' | player1: ' + ongoing[client.room]['player1'] + ' | player2: ' + ongoing[room]['player2']); //FIXME logging
    } else if (!ongoing[client.room]['player1']) {
        ongoing[room]['player1'] = client.id;
        client.pn = 1;
    } else if (!ongoing[client.room]['player2']) {
        ongoing[room]['player2'] = client.id;
        client.pn = 2;
    } else {
        ongoing[room]['spectators'] += 1;
        client.pn = 3;
    }
    client.emit('new-connect', {'pn': client.pn ,
        'board': ongoing[client.room]['board'],
        'nextPlayer': ongoing[client.room]['nextMove']
        });
    
    console.log('[CON] room: ' + client.room + ' | pn: ' + client.pn + ' | id: ' + client.id); //FIXME logging
    
    // on disconnect 
    client.on('disconnect', function(data) {
    
        console.log('[DCN] room: ' + client.room + ' | pn: ' + client.pn + ' | id: ' + client.id); //FIXME logging
        // log player disconnect
        if (client.pn == 1) {
            ongoing[client.room]['player1'] = false;
        } else if (client.pn == 2) {
            ongoing[client.room]['player2'] = false;
        } else {
            ongoing[client.room]['spectators'] -= 1;
        }

        // destroy room if nobody left
        if (!ongoing[client.room]['player1'] && !ongoing[client.room]['player2'] && !ongoing[client.room]['spectators']) {
            console.log('[DEL] room: ' + client.room + ' | player1: ' + ongoing[client.room]['player1'] + ' | player2: ' + ongoing[client.room]['player2'] + ' | spectators: ' + ongoing[client.room]['spectators']); //FIXME logging
            
            ongoing = deleteKey(ongoing, [client.room]);
        }
    });
    
    // sending moves
    client.on('send-move', function(data) {
        // validate move
        if (client.pn == ongoing[client.room]['nextMove'] && 
            ongoing[client.room]['board'][data['outer']][data['inner']] != 'e')
            return;

        if (ongoing[client.room]['nextMove'] == 0)
            return;

        ongoing[client.room]['nextMove'] = (ongoing[client.room]['nextMove'] == 1) ? 2 : 1;

        // update board
        ongoing[client.room]['board'][data['outer']][data['inner']] = data['player']['symbol'];
        disableAll(ongoing[client.room]['board']);
         
        // check for captures
        if (isCaptured(ongoing[client.room]['board'], data['outer'])) {
            for (inner = 0; inner < 9; inner++)
                ongoing[client.room]['board'][data['outer']][inner] = client.pn;
            
            if (isWon(ongoing[client.room]['board'])) {
                io.in(client.room).emit('game-over', {'winner': client.pn});
                ongoing[client.room]['nextMove'] = 0;
                console.log('[WIN] room: ' + client.room + ' | player: ' + client.pn); //FIXME logging
            } else if (isTie(ongoing[client.room]['board'])) {
                io.in(client.room).emit('game-over', {'winner': 0});
                ongoing[client.room]['nextMove'] = 0;
                console.log('[TIE] room: ' + client.room); //FIXME logging
            }

        }

        // enable moves
        if (ongoing[client.room]['board'][data['inner']][0] == '1' ||
           ongoing[client.room]['board'][data['inner']][0] == '2' ||
           isFull(ongoing[client.room]['board'], data['inner'])) {
            enableAll(ongoing[client.room]['board']);
        } else {
            enableBlock(ongoing[client.room]['board'], data['inner']);
        }

        // send move
        data['nextPlayer'] = ongoing[client.room]['nextMove'];
        data['board'] = JSON.parse(JSON.stringify(ongoing[client.room]['board']));
        client.broadcast.to(client.room).emit('push-move', data);
    });

});


server.listen(8080);
