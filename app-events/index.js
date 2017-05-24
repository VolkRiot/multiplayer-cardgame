Sequelize = require('sequelize');
module.exports = function(io, db) {

  var pTotal        = 4,
      newRoom       = undefined,
      roomQueue     = 0,
      rooms         = {};

  io.on('connection', function(socket) {

    socket.on('player join', function(user) {
      roomQueue++;

      user.id = socket.id;
      user.socket = socket;

      if(roomQueue === 1){
        newRoom = 'room' + String(Math.floor(Math.random() * 10000));
        rooms[newRoom] = {
          players: [],
          room: newRoom,
          judgeInd: 0,
          roundSubs: 0,
          playerReady: 0,
          roundInterval: undefined
        };
      }

      if (rooms[newRoom].players.length < pTotal) {
        rooms[newRoom].players.push(user);
        user.room = newRoom;
      }

      socket.join(newRoom);

      // Activate chat
      require('./chat')(socket, db, io, newRoom);

        var active = rooms[newRoom].players.map(function(each, i) {
          return {
            uid: each.id,
            name: each.user_name,
            photo: each.photo,
            score: 0,
            order: i
          };
        });

        io.to(newRoom).emit('player added', active);

      socket.emit("userID", {
        uid: user.id,
        order: rooms[newRoom].players.length,
        room: rooms[newRoom].room
      });

      // When 4 players login Start game
      if (rooms[newRoom].players.length >= 4) {

        // Create object reference for players by their Socket.id
        rooms[newRoom].playrRef = rooms[newRoom].players.reduce(function(map, user) {
          map[user.id] = user;
          return map;
        }, {});
        roomQueue = 0;
        StartGame(rooms[newRoom]);
      }

      });

    socket.on('meme submission', function(sub) {

      if (rooms[sub.room].playrRef.hasOwnProperty(sub.user)) {
        // Count submission

        sub.round = rooms[sub.room].roundSubs;
        rooms[sub.room].roundSubs++;

        io.to(sub.room).emit('generate card', sub);

        if (rooms[sub.room].roundSubs >= 4) {
          // All four things submitted
          rooms[sub.room].roundSubs = 0;
          clearInterval(rooms[sub.room].roundInterval);
          io.to(sub.room).emit('judgment round')
        }
      }

    });

    socket.on('judge hovering', function(judge) {
      socket.broadcast.to(judge.room).emit('judge looking', judge.id)
    });

    socket.on('judge unhovering', function(judge) {
      socket.broadcast.to(judge.room).emit('judge unlooking', judge.id)
    });

    socket.on('decision', function(chosen) {

      var winner = rooms[chosen.room].playrRef[chosen.playerID];
      io.to(chosen.room).emit('announce winner', {
        name: winner.user_name,
        card_id: chosen.cardId,
        uid: chosen.playerID
      });
      
    });

    socket.on('player ready', function(room) {
      rooms[room].playerReady++;

      if(rooms[room].playerReady === 4){
        rooms[room].countdown = 30;
        clearInterval(rooms[room].roundInterval);

        rooms[room].roundInterval = function() {
          if (rooms[room].countdown < 1) {
            io.to(room).emit('round end');
            clearInterval(this);
          }

          io.to(room).emit('timer', {
            ct: rooms[room].countdown
          });

          rooms[room].countdown--;
        };

        setInterval(rooms[room].roundInterval, 1000);
      }

    });

    socket.on('next round', function(room) {
      rooms[room].playerReady = 0;
      StartGame(rooms[room]);
    });

    // TODO: NEEDS DEBUGGING, -- see Mikhail M.
    socket.on('disconnect', function(){

    //   // Rebuild player array without disconnected user
    //   var remain = [];
    //
    //   players.map(function(each) {
    //     if(!each.id === socket.id){
    //         remain.push(each);
    //     }
    //   }, this);
    //   players = remain;
    //
    // });

  });


  function StartGame(room) {

    db.Meme.find({
      order: [
        Sequelize.fn('RAND')
      ]
    }).then(function(meme) {

      var round = {
        meme: meme,
        judgeID: room.players[room.judgeInd].id
      };

      room.actJudge = room.players[room.judgeInd];
      room.judgeInd >= room.players.length - 1 ? room.judgeInd = 0 : room.judgeInd++;
      io.to(room.room).emit('start round', round);

    });
  }

});

};
