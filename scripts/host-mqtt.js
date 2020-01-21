let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let roomInfo;
let localPlayer;
let old;

// ***********  when succesfully connected to broker ***********

const onConnect = function() {
  console.log('Connected');

  mqtt.subscribe(roomInfo.roomId);
  let message = new Paho.MQTT.Message(JSON.stringify(new Message('lobbyReady', '')));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
  message = new Paho.MQTT.Message(JSON.stringify(new Message('playerReady', playerId)));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};

// ***********  when succesfully connected to broker ***********

const onConnectGuest = function() {
  console.log('Connected');

  mqtt.subscribe(roomId);
  if (old) {
    message = new Paho.MQTT.Message(JSON.stringify(new Message('playerUpdate', localPlayer)));
    message.destinationName = roomId;
    mqtt.send(message);
  } else {
    let guest = new Player(playerId);
    message = new Paho.MQTT.Message(JSON.stringify(new Message('player', guest)));
    message.destinationName = roomId;
    mqtt.send(message);
  }

  //setTimeout(roomNotFound, 3000);
};
// ***********  not succesfully connected to broker ***********

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};
// ***********  when a message arrives ***********

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
  let incommingMessage = JSON.parse(msg.payloadString);
  switch (incommingMessage.type) {
    case 'player':
      {
        if (playerRole == 'Host') {
          let newplayer = incommingMessage.message;
          if (roomInfo.players.length < 4) {
            roomInfo.addPlayer(newplayer);
            message = new Paho.MQTT.Message(JSON.stringify(new Message('roomInfo', roomInfo)));
            message.destinationName = roomInfo.roomId;
            mqtt.send(message);
            showplayers();
            for (let player of roomInfo.players) {
              if (player.ready == false) {
                notReady = true;
              }
            }
            if (!notReady) {
              domStart.style.display = 'block';
            } else {
              domStart.style.display = 'none';
            }
          } else {
            message = new Paho.MQTT.Message(JSON.stringify(new Message('error', { toId: newplayer.id, errorMessage: 'room full' })));
            message.destinationName = roomInfo.roomId;
            mqtt.send(message);
          }
        }
      }
      break;
    case 'playerUpdate':
      {
        if (playerRole == 'Host') {
          let newplayer = incommingMessage.message;
          roomInfo.updatePlayer(newplayer);
          showplayers();
          message = new Paho.MQTT.Message(JSON.stringify(new Message('roomInfo', roomInfo)));
          message.destinationName = roomInfo.roomId;
          mqtt.send(message);
        }
      }
      break;
    case 'playerReady':
      {
        if (playerRole == 'Host') {
          for (let player in roomInfo.players) {
            if (roomInfo.players[player].id == incommingMessage.message) {
              roomInfo.players[player].ready = !roomInfo.players[player].ready;
            }
          }
          showplayers();
          message = new Paho.MQTT.Message(JSON.stringify(new Message('roomInfo', roomInfo)));
          message.destinationName = roomInfo.roomId;
          mqtt.send(message);
          let notReady = false;
          for (let player of roomInfo.players) {
            if (player.ready == false) {
              notReady = true;
            }
          }
          if (!notReady) {
            domStart.style.display = 'block';
          } else {
            domStart.style.display = 'none';
          }
        }
      }
      break;
    case 'disconnect':
      {
        if (playerRole == 'Host') {
          roomInfo.removePlayer(incommingMessage.message);
          showplayers();
          message = new Paho.MQTT.Message(JSON.stringify(new Message('roomInfo', roomInfo)));
          message.destinationName = roomInfo.roomId;
          mqtt.send(message);
        }
      }
      break;
    case 'roomInfo':
      {
        if (playerRole == 'Guest') {
          console.log('roomInfo received');
          roomInfo = incommingMessage.message;
          showplayers(roomInfo);
          updateNameInput();
          updateSnakeColor();
        }
      }
      break;
    case 'startGame':
      {
        if (playerRole == 'Guest') {
          roomInfo = JSON.stringify(incommingMessage.message.roomInfo);
          sessionStorage.setItem('roomInfo', roomInfo);
          sessionStorage.setItem('startTime', incommingMessage.message.startTime);
          sessionStorage.setItem('playerId', playerId);
          console.log('startgame received', incommingMessage);
          window.location.href = 'game.html';
        }
      }
      break;
    case 'error':
      {
        if (playerRole == 'Guest') {
          if (incommingMessage.message.errorMessage == 'room full' && incommingMessage.message.toId == playerId) {
            console.log('room is full redirecting');
            window.location.href = 'join.html?error=roomFull';
          }
        }
      }
      break;

    default:
      console.log('not existing type:', incommingMessage);
  }
};

// ***********  connect to broker ***********

const MQTTconnect = function(succesCallback) {
  console.log('connecting to ' + host);
  mqtt = new Paho.MQTT.Client(host, Number(port), playerId);
  let options = {
    timeout: 0,
    onSuccess: succesCallback,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};
