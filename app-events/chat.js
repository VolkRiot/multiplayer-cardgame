// Chat message implementation here.
module.exports = function(socket, db, io, room){
    socket.on('chat message', function(msg){

      db.User.findOne({
        where: {
          user_name: msg.name
        }
      }).then(function(user) {
        db.Message.create({
          message: msg.text,
          user_name: msg.name,
          UserId: user.id
        });
      });

      io.to(room).emit('chat message', msg);
    });

    socket.on('disconnect', function(){
      // Chat disconnect probably not important?
    });

};