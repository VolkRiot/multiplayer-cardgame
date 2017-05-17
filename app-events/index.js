Sequelize = require('sequelize');

module.exports = function(io, db) {

  var players = [];
  var judgeInd = 0;

  io.on('connection', function(socket){
    require('./chat')(socket, db);

    console.log("Socket is: ",socket.id);

    socket.on('player join', function(user) {

      user.id = socket.id;
      user.socket = socket;

      players.push(user);

      user.socket.emit("userID", user.id);

      // DEBUGGING TODO: (REMOVE) /////////////////////////////////////////////
      players.forEach(function(player) {
        console.log("Players joined: ", player.user_name);
      });
      /////////////////////////////////////////////////////////////////////////

      // When 4 players login Start game
      if(players.length >= 4) {
        StartGame();
      }

    });

  });

  function StartGame(){

    db.Meme.find({
      order: [
        Sequelize.fn( 'RAND' )
      ]
    }).then(function(meme){

      var round = {
        meme: meme,
        judgeID: players[judgeInd].id
      };

      judgeInd >= players.length - 1 ? judgeInd = 0 : judgeInd++;

      io.emit('start round', round)


    });


  }

};