let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 443;
let loadedPlayers = {};
hostNotified = false;

const notifyHost = function() {
  if (!hostNotified) {
    message = new Paho.MQTT.Message(JSON.stringify(new Message('playerLoaded', playerId)));
    message.destinationName = roomInfo.roomId;
    mqtt.send(message);
    setTimeout(notifyHost, 1000);
  }
};

const onConnect = function() {
  mqtt.subscribe(roomInfo.roomId);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  message = JSON.parse(msg.payloadString);
  switch (message.type) {
    case 'playerLoaded':
      {
        if (playerNr == 0) {
          loadedPlayers[message.message] = true;
          message = new Paho.MQTT.Message(JSON.stringify(new Message('playerOk', message.message)));
          message.destinationName = roomInfo.roomId;
          mqtt.send(message);

          if (new Set(Object.values(loadedPlayers)).size === 1) {
            message = new Paho.MQTT.Message(JSON.stringify(new Message('startGame', '')));
            message.destinationName = roomInfo.roomId;
            mqtt.send(message);
          }
        }
      }
      break;
    case 'playerOk':
      {
        if (playerId == message.message) {
          hostNotified = true;
        }
      }
      break;

    case 'startGame':
      {
        beginGame();
      }
      break;
    case 'snake':
      {
        for (let t in snakes) {
          if (snakes[t].Id == message.message.Id) {
            snakes[t].Name = message.message.Name;
            snakes[t].Speed = message.message.Speed;
            snakes[t].Tail = message.message.Tail;
            snakes[t].Color = message.message.Color;
            snakes[t].Inputbuffer = message.message.Inputbuffer;
            snakes[t].Isalive = message.message.Isalive;
            snakes[t].score = message.message.score;
            snakes[t].distanceMoved = message.message.distanceMoved;
            snakes[t].fruitEaten = message.message.fruitEaten;
            snakes[t].candyEaten = message.message.candyEaten;
            snakes[t].topSpeed = message.message.topSpeed;
            snakes[t].heartbeat = message.message.heartbeat;

            ctx.clearRect(0, 0, gamewidth, gameheight);
            drawFruit();
            drawCandy();
          }
        }
      }
      break;
    case 'fruit':
      {
        fruit = message.message;
        drawFruit();
      }
      break;
    case 'candy':
      {
        candy = message.message;
        drawCandy();
      }
      break;
    case 'gameOver':
      {
        stop = true;
      }
      break;
    case 'disconnect':
      {
        for (let player in roomInfo.players) {
          if (roomInfo.players[player].id == message.message) {
            for (let snake in snakes) {
              if (snakes[snake].Name == roomInfo.players[player].name) {
                snakes.splice(snake);
              }
            }
            delete loadedPlayers[message.message];
            roomInfo.players.splice(player);
            setTimeout(function() {
              ctx.clearRect(0, 0, gamewidth, gameheight);
              drawFruit();
              drawCandy();
            }, 601);
            if (!stop) {
              initializeScores();
            }
          }
        }
      }
      break;

    default: {
      console.log('unknown message');
    }
  }
};

const MQTTconnect = function() {
  mqtt = new Paho.MQTT.Client(host, Number(port), playerId);
  let options = {
    timeout: 0,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};
