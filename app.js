var
http = require('http'),
path = require('path'),
fs = require('fs'),
swig = require('swig'),
socket = require('socket.io');

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
    // serve main page
    } else {
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
    // function
    function getRoom () { // refactor
        rooms = io.nsps['/'].adapter.rooms;
        for (room in rooms) {
            for (user in rooms[room]) {
                if (user != room && client.id in rooms[room]) {
                    return room;
                }
            }
        }
    };
    
    // connect to room
    client.join(room);

    // initialize game
    client_list = io.sockets.adapter.rooms[room];
    client_list_length = Object.keys(client_list).length;

    client.emit('new-game', {'connections': client_list_length });
   
    // initialize room 
    if (client_list_length == 1)
        ongoing[room] = emptyBoard;

    // update board
    for(outer = 0; outer < 9; outer++) {
        for (inner = 0; inner < 9; inner++) {
            if (!!ongoing[room][outer][inner]) {
                player = {
                    'number': (ongoing[room][outer][inner] == 'O') ? 1 : 2, 
                    'symbol': ongoing[room][outer][inner],
                    'isTurn': false,
                    'isSpectator': false,
                };

                data = {
                    'player': player, 
                    'outer': outer,
                    'inner': inner,
                    'isReplay': true
                };
                console.log(data);
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
    });
    
    // sending moves
    client.on('send-move', function(data) {
        console.log(data);
        ongoing[getRoom()][data['outer']][data['inner']] = data['player']['symbol'];
        console.log(ongoing[getRoom()]);
        client.broadcast.emit('push-move', data);
    });

});


server.listen(8080);
