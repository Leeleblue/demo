var
  kuzzle = Kuzzle.init(config.kuzzleUrl),
  whoami = {},
  subcriptionId,
  CHAT_MSG_COLLECTION = 'demo-chat-messages',
  CHAT_ROOM_COLLECTION = 'demo-chat-chatrooms',
  GLOBAL_CHAT_ROOMID = undefined,
  GLOBAL_CHAT_ROOM = 'main room';

/**
* Listen to incoming chat messages and display them
* Chat messages are publish/subscribe messages
*
* @param {string} chatRoom is the name of the chat room
*/
function listenMessages(chatRoom) {
  if (subcriptionId) {
    kuzzle.unsubscribe(subcriptionId);
  }

  subcriptionId = kuzzle.subscribe(CHAT_MSG_COLLECTION, {term: {chatRoom: chatRoom}}, function (error, newMessage) {
    var $messageFlow = $('#messageFlow');

    if (error) {
      throw new Error(error);
    }

    // Autoscroll
    if (($messageFlow[0].scrollHeight - $messageFlow.innerHeight()) === $messageFlow.scrollTop()) {
      $messageFlow.animate({scrollTop: $messageFlow[0].scrollHeight}, 300);
    }

    // Appending the received message
    $messageFlow.append(
      '<div class="message"><strong style="color: ' +
      newMessage._source.ownerColor +
      ';">' +
      newMessage._source.owner +
      ' :</strong> ' +
      newMessage._source.content +
      '</div>'
    );
  });
}

/**
* Send the given content to Kuzzle as a pub/sub message
*/
function sendMessage() {
  var
    $input = $('#inputChatMessage'),
    content = $input.val(),
    message = {
        content: content,
        owner: whoami.userName,
        ownerColor: whoami.userColor,
        chatRoom: whoami.chatRoom
    };

  // Broadcast and reset the input
  kuzzle.create(CHAT_MSG_COLLECTION, message);
  $input.val("");
}

/**
* Get the number of users listening to the current chat room, and update
* the introductory message with it
*/
function updateUserCount() {
  kuzzle.countSubscription(subcriptionId, function (error, response) {
    if (error) {
      throw new Error(error);
    }

    $('#userCount').text('There are ' + response + ' users connected to [' + whoami.chatRoom + ']');
  });
}

/**
* Retrieve and display existing rooms
*/
function refreshRooms() {
  $('#roomList').empty();

  kuzzle.search(CHAT_ROOM_COLLECTION, {}, function (error, rooms) {
    if (error) {
      throw new Error(error);
    }
    else {
      // create a default room if none exist
      if (rooms.hits.total === 0) {
        $('#switchRoom').text(GLOBAL_CHAT_ROOM);
        kuzzle.create(CHAT_ROOM_COLLECTION, {name: GLOBAL_CHAT_ROOM}, true);
      }
      else {
        rooms.hits.hits.forEach(function (room) {
          if (room._source.name === whoami.chatRoom) {
            $('#switchRoom').text(room._source.name);
          }

          if (room._source.name === GLOBAL_CHAT_ROOM) {
            GLOBAL_CHAT_ROOMID = room._id;
          }

          addRoomSwitch(room._id, room._source.name);
        });
      }
    }
  });
}

/**
* Create a new room in Kuzzle
*/
function createRoom(newRoomName) {
  var query = {
  		query: {
  			match: {
  				name: newRoomName
  			}
  		}
  	};

  kuzzle.count(CHAT_ROOM_COLLECTION, query, function (error, response) {
    if (response.count > 0) {
      alert('The room ' + newRoomName + ' already exists');
    }
    else {
      kuzzle.create(CHAT_ROOM_COLLECTION, {name: newRoomName}, true, function (error, room) {
        switchRoom(room._id, newRoomName);
      });
    }
  });
}

/**
* Delete the current room, if no other user is connected to it
*/
function deleteCurrentRoom() {
  kuzzle.countSubscription(subcriptionId, function (error, response) {
    var room = whoami.chatRoom;
    if (response > 1) {
      alert('You can\'t remove a non-empty room. Please ask people to leave first!');
    } else {
      kuzzle.delete(CHAT_ROOM_COLLECTION, whoami.chatRoomId, function (error, response) {
        alert('Room ' + whoami.chatRoom + ' removed');
        switchRoom(GLOBAL_CHAT_ROOMID, GLOBAL_CHAT_ROOM);
      });
    }
  });
}

/**
*   *********************************************************
*   Starting from here, the code deals only with the chat GUI
*   There is no further interaction with Kuzzle.
*   *********************************************************
*/

function startDemo() {
  whoami = {
    userName: 'Anonymous',
    userColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
    chatRoom: GLOBAL_CHAT_ROOM
  };

  updateAliasButton();
  listenMessages(GLOBAL_CHAT_ROOM);
  refreshRooms();
  setInterval(function() { refreshRooms(); }, 2000);
  setInterval(function() { updateUserCount(); }, 500);

  // Clicking the alias button asks the user for a new alias
  $('#changeAlias').click(function (e) {
    var newName;

    e.preventDefault();
    newName = prompt('Please enter your name', whoami.userName);

    if (newName) {
      whoami.userName = newName;
      updateAliasButton();
    }
  });

  // Clicking on the 'Send message' button sends the message
  $('#sendChatMessage').click(function (e) {
    e.preventDefault();
    sendMessage();
  });

  // Pressing enter in the input area sends the message
  $('#inputChatMessage').on('keydown', function (e) {
    // (ENTER key)
    if (e.which == 13) {
      sendMessage();
    }
  });

  // Add a new room
  $('#createRoom').click(function (e) {
    var newRoom;

    e.preventDefault();
    newRoom = prompt('New room name');

    if (newRoom) {
      createRoom(newRoom);
    }
  });

  $('#deleteRoom').click(function (e) {
    e.preventDefault();

    if (whoami.chatRoom === GLOBAL_CHAT_ROOM) {
      alert('You may only remove rooms other than the main one');
      return;
    }

    deleteCurrentRoom();
  });
}

function updateAliasButton() {
  $('#alias').text(whoami.userName);
}

// Add a room to the room list, with its switch trigger
function addRoomSwitch(roomId, roomName) {
  $('#roomList').append('<li><a id="' + roomId + '" href="#">' + roomName + '</a></li>');

  // Clicking the room button triggers a room Switch
  $('#' + roomId).click(function(e) {
    e.preventDefault();
    switchRoom(roomId, roomName);
  });
}

/**
* Switch to a new room
*/
function switchRoom(newRoomId, newRoomName) {
  if (newRoomName === whoami.chatRoom) {
    return false;
  }

  $('#switchRoom').text(newRoomName);
  whoami.chatRoom = newRoomName;
  whoami.chatRoomId = newRoomId;
  listenMessages(newRoomName);
  refreshRooms();

  $('#messageFlow').append('<div class="message"><small>Entering room [' + newRoomName + ']</small></div>');
}
