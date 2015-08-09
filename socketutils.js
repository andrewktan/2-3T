module.exports.onConnect = function(io, ongoing, roomName) {
    return function (client) {
        // connect to room
        client.room = roomName;
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
            ongoing[client.room]['board'] = JSON.parse(JSON.stringify(gu.emptyBoard));    // feels dirty
            client.pn = 1;
        
            console.log('[NEW] room: ' + client.room + ' | player1: ' + ongoing[client.room]['player1'] + ' | player2: ' + ongoing[client.room]['player2']); //FIXME logging
        } else if (!ongoing[client.room]['player1']) {
            ongoing[client.room]['player1'] = client.id;
            client.pn = 1;
        } else if (!ongoing[client.room]['player2']) {
            ongoing[client.room]['player2'] = client.id;
            client.pn = 2;
        } else {
            ongoing[client.room]['spectators'] += 1;
            client.pn = 3;
        }
        // send connection data
        client.emit('new-connect', {'pn': client.pn ,
            'board': ongoing[client.room]['board'],
            'nextPlayer': ongoing[client.room]['nextMove']
            });

        // display message to opponent
        if (client.pn < 3) {
        client.broadcast.to(client.room).emit(
                'display-message', 
                {'to': [1, 2], 'message': 'Opponnent connected.'}
            );
        client.broadcast.to(client.room).emit(
                'display-message', 
                {'to': [3], 'message': 'Player ' + client.pn + ' connected.'}
            );
        } else {
            client.broadcast.to(client.room).emit(
                    'display-message',
                    {'to': [1, 2, 3], 'message': 'Spectator connected.'}
                );
        }

        console.log('[CON] room: ' + client.room + ' | pn: ' + client.pn + ' | id: ' + client.id); //FIXME logging
        
        // on disconnect 
        client.on('disconnect', su.onDisconnect(client, ongoing[client.room]));
        
        // sending moves
        client.on('send-move', su.sendMove(io, client, ongoing[client.room]));
    }
}


module.exports.sendMove = function(io, client, room) {
    return function (data) {
        // validate move
        if (client.pn == room['nextMove'] && 
            room['board'][data['outer']][data['inner']] != 'e')
            return;

        if (room['nextMove'] == 0)
            return;

        room['nextMove'] = (room['nextMove'] == 1) ? 2 : 1;

        // update board
        room['board'][data['outer']][data['inner']] = data['player']['symbol'];
        gu.disableAll(room['board']);
         
        // check for captures
        if (gu.isCaptured(room['board'], data['outer'])) {
            for (inner = 0; inner < 9; inner++)
                room['board'][data['outer']][inner] = client.pn;
            
            if (gu.isWon(room['board'])) {
                io.in(client.room).emit('game-over', {'winner': client.pn});
                room['nextMove'] = 0;
                console.log('[WIN] room: ' + client.room + ' | player: ' + client.pn); //FIXME logging
            } else if (gu.isTie(room['board'])) {
                io.in(client.room).emit('game-over', {'winner': 0});
                room['nextMove'] = 0;
                console.log('[TIE] room: ' + client.room); //FIXME logging
            }

        }

        // enable moves
        if (room['board'][data['inner']][0] == '1' ||
           room['board'][data['inner']][0] == '2' ||
           gu.isFull(room['board'], data['inner'])) {
            gu.enableAll(room['board']);
        } else {
            gu.enableBlock(room['board'], data['inner']);
        }

        // send move
        data['nextPlayer'] = room['nextMove'];
        data['board'] = JSON.parse(JSON.stringify(room['board']));
        client.broadcast.to(client.room).emit('push-move', data);
    }
}

module.exports.onDisconnect = function(client, room) {
    return function (data) {
        console.log('[DCN] room: ' + client.room + ' | pn: ' + client.pn + ' | id: ' + client.id); //FIXME logging
        // log player disconnect
        if (client.pn == 1) {
            room['player1'] = false;
        } else if (client.pn == 2) {
            room['player2'] = false;
        } else {
            room['spectators'] -= 1;
        }

        // destroy room if nobody left
        if (!room['player1'] && !room['player2'] && !room['spectators']) {
            console.log('[DEL] room: ' + client.room + ' | player1: ' + room['player1'] + ' | player2: ' + room['player2'] + ' | spectators: ' + room['spectators']); //FIXME logging
            
            ongoing = deleteKey(ongoing, [client.room]);
        }
        if (client.pn < 3) {
            client.broadcast.to(client.room).emit(
                    'display-message', 
                    {'to': [1, 2], 'message': 'Opponnent disconnected.'}
                );
            client.broadcast.to(client.room).emit(
                    'display-message', 
                    {'to': [3], 'message': 'Player ' + client.pn + ' disconnected.'}
                );
        } else {
             client.broadcast.to(client.room).emit(
                    'display-message', 
                    {'to': [1, 2, 3], 'message': 'Spectator disconnected.'}
                );
       }
    }
}
