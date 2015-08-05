var
http = require('http'),
path = require('path'),
fs = require('fs'),
swig = require('swig'),
socket = require('socket.io'),
deleteKey = require('key-del');

var tpl = swig.compileFile('/home/andrew/2-3T/templates/index.html');

var room, ongoing = {}, emptyBoard = new Array(); // refactor

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
    } else {    // serve main page
        room = fileName; // temporary
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(tpl());
        res.end();
	}
});

// generate empty board

for (i=0; i<9; i++) {
    emptyBoard[i] = new Array();
    for (j=0; j<9; j++)
        emptyBoard[i][j] = null;
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
    if (!(room in ongoing)) {
        console.log('new room ' + client.room);
        ongoing[room] = {};
        ongoing[room]['player1'] = client.id;
        ongoing[room]['player2'] = false;
        ongoing[room]['nextMove'] = 1;
        ongoing[room]['board'] = JSON.parse(JSON.stringify(emptyBoard));    // feels dirty
        client.pn = 1;
    } else if (!ongoing[client.room]['player1']) {
        ongoing[room]['player1'] = client.id;
        client.pn = 1;
    } else if (!ongoing[client.room]['player2']) {
        ongoing[room]['player2'] = client.id;
        client.pn = 2;
    } else {
        client.pn = 3;
    }
    client.emit('new-game', {'connections': client.pn });
    
    // update board
    for(outer = 0; outer < 9; outer++) {
        for (inner = 0; inner < 9; inner++) {
            if (!!ongoing[client.room]['board'][outer][inner]) {
                player = {
                    'number': (ongoing[client.room]['board'][outer][inner] == 'O') ? 1 : 2, 
                    'symbol': ongoing[client.room]['board'][outer][inner],
                    'isTurn': false,
                    'isSpectator': false,
                };

                data = {
                    'player': player, 
                    'outer': outer,
                    'inner': inner,
                    'isReplay': true
                };
                client.emit('push-move', data);
            }
        }
    }

    // on pushing grid
    client.on('pull-grid', function(data) {
        console.log(data);
    });
    
    // on disconnect 
    client.on('disconnect', function(data) {
        // log player disconnect
        console.log('room : ' + client.room + '| disconnected: ' + ongoing[client.room]);
        if (client.pn == 1) {
            ongoing[client.room]['player1'] = false;
        } else if (client.pn == 2) {
            ongoing[client.room]['player2'] = false;
        }

        // destroy room if both players disconnect
        if (!ongoing[client.room]['player1'] && !ongoing[client.room]['player2']) {
            ongoing = deleteKey(ongoing, [client.room]);
            console.log('deleted room ' + client.room);
        }
    });
    
    // sending moves
    client.on('send-move', function(data) {
        ongoing[client.room]['board'][data['outer']][data['inner']] = data['player']['symbol'];
        console.log(ongoing[client.room]);
        client.broadcast.to(client.room).emit('push-move', data);
    });

});


server.listen(8080);
