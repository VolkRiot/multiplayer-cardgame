$(document).ready(function() {

  var socket = io(),
    self = {},
    submitted = false,
    roundSubs = 0,
    judgeMode = false;

  $.get('/api/user', function(user) {
    self = user;

    socket.emit('player join', self);

    socket.on("userID", function(user) {
      self.id = user.uid;

    });

    $('#message-submit').on('click', function(e) {
      e.preventDefault();

      var messageInput = $('#message-input').val().trim();

      if (messageInput !== '') {
        var message = {
          name: self.user_name,
          photo: self.photo,
          text: messageInput
        };
        socket.emit('chat message', message);
        $('#message-input').val('')

      }

    });

    socket.on('chat message', function(message) {

      var msg = "<p class='chat-p'><img class='chat-thumbnail' src='" + message.photo + "'>" + ': ' + message.text + "</p>";
      var $chatDsp = $(".chat-display");

      $chatDsp[0].scrollTop = $chatDsp[0].scrollHeight;
      $chatDsp.append(msg);
      $chatDsp.animate({
        scrollTop: $chatDsp[0].scrollHeight
      }, "slow");

    });

  });

  socket.on('start round', function(round) {
    resetRound();

    submitted = false;
    roundSubs = 0;

    $('.topic-image').attr({
      "src": round.meme.url,
      "id": round.meme.id,
      "data-external": round.meme.imgFlipID
    }).load(function() {
      if (self.id === round.judgeID) {
        // Judge mode
        console.log("You the judge");

        judgeMode = true; // See!? I told you -- Judge Mode
        // TODO: Indicate to player they are judge

      } else {
        // Players Mode
        judgeMode = false;
        $(".choice-card-img").off('click');
      }
      socket.emit('player ready');

    });

  });

  socket.on('judgment round', function() {

    if (judgeMode) {
      $(".choice-card-img").on('click', function() {
        socket.emit('decision', {
          playerID: $(this).attr('data-id'),
          cardId: $(this).attr('id')
        });
        $(tag).closest(".choice-card").removeClass('judge-hover');

      })
    }
  });

  socket.on('announce winner', function(winner) {
    // Ex. winner = {name: "Misha Metrikin, card_id: "card-1"}
    var card = "#" + winner.card_id;
    console.log("self: " + JSON.stringify(self));
    console.log("winner: " + JSON.stringify(winner));
    if(self.uid === winner.uid)
    {
      self.score++;
    }
    console.log($('.player-score'));
    $(".player-score").each(function()
    {
      if($(this).attr("id") === "score" + winner.uid)
      {
        var newScore = parseInt($(this).text()) + 1;
        $(this).text(newScore);
      }
    });
    console.log("Winner ready to annouce with id ", card);

    // Set stuff in the winner modal
    $('#winner-modal-title').text("Winner: " + winner.name);
    $('#winner-modal-meme').attr('src', $(card).attr('src'));
      //.load(function() {
        $('#best-meme').modal('show');

        setTimeout(function() {
          $('#best-meme').modal('hide').load(function() {

          });

          if(judgeMode){
            socket.emit('next round');
          }

        }, 3000);

      //});

  });

  function rewriteScore()
  {

  }

  socket.on('timer', function(data) {
    // TODO:(Victor Tsang) Improve UI of timer here..
    $('#time').html("Time Remaining: " + data.countdown);

  });

  // TODO: (Victor Tsang) Implement score using this event
  socket.on('player added', function(players) {
    $(".players").empty();
    players.forEach(function(item, index) {
      //console.log(item);
      $(".players").append("<div class='player'><img class='player-image' src='" + item.photo + "'/><span class='player-score' id='score"+item.uid+"'>" + item.score + "</span></div>");
    });
  });


  $(".choice-card-img").mouseenter(function() {
    if (judgeMode) {
      socket.emit('judge hovering', $(this).attr('id'))
    }
  });

  $(".choice-card-img").mouseleave( function() {
    if (judgeMode) {
      socket.emit('judge unhovering', $(this).attr('id'))
    }
  });

  socket.on('judge looking', function(imgId) {
    var tag = '#' + imgId;
    $(tag).closest(".choice-card").addClass('judge-hover');
  });

  socket.on('judge unlooking', function(imgId) {
    var tag = '#' + imgId;
    $(tag).closest(".choice-card").removeClass('judge-hover');
  });


  $('#meme-submit').on('click', function() {

    var memeText = {
      memeId: $('.topic-image').attr("data-external"),
      top: $('#top-text').val().trim() || '',
      bottom: $('#bottom-text').val().trim() || ''
    };

    // Generates a meme with get request to route
    $.post('/memes/create', memeText, function(resp) {
      self.meme = resp;
      SendSubmission(self);
    })

  });

  socket.on('round end', function() {
    if (!submitted) {
      SendSubmission(self);
    }
    $(".timer").hide();
    $("#player-cards").hide();
    $("#choice-card-container").show();
    self.meme = undefined;

  });

  socket.on('generate card', function(sub) {
    generateCard(sub);
  });

  function generateCard(card) {
    var choiceCards = document.getElementsByClassName("choice-card-img");

    $(choiceCards[card.round]).attr({
      "src": card.meme,
      "data-id": card.user
    }).load(function() {
      $(this).closest('.choice-card').css('display', 'block');
    })

  }

  function SendSubmission(user) {
    submission = {
      user: user.id,
      meme: user.meme ||
        'https://img.memesuper.com/8442baface38e99f6bfa4d828f13e05f_motivation-level-lazy-puppy-lazy-meme_428-247.jpeg'
      //TODO: What should be the default if nothing submitted?
    };
    socket.emit('meme submission', submission);
    submitted = true;
  }

  function resetRound() {
    $(".choice-card").css('display', 'none');
    $(".timer").show();
    $("#player-cards").show();
    $(".choice-card-img").attr('src', 'http://i3.ytimg.com/vi/frlDkcG8Z9E/hqdefault.jpg');
    $("#choice-card-container").hide();
  }

});
