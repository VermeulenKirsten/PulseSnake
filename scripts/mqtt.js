let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
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
  console.log('Connected');
  mqtt.subscribe(roomInfo.roomId);
  notifyHost();
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
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
            console.log('all players are loaded');

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
        // console.log('snake message received ');
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

            ctx.clearRect(0, 0, gamewidth, gameheight);
            //show the fruit
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(fruit[1] * scalefactor, fruit[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
            // show the candy
            ctx.fillStyle = '#FF00FF';
            ctx.fillRect(candy[1] * scalefactor, candy[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
          }
        }
      }
      break;
    case 'fruit':
      {
        console.log('fruit  message received ', message.message);
        fruit = message.message;
        //show the fruit
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(fruit[1] * scalefactor, fruit[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
      }
      break;
    case 'candy':
      {
        console.log('candy message received ', message.message);
        candy = message.message;
        // show the candy
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(candy[1] * scalefactor, candy[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
      }
      break;
    case 'gameOver':
      {
        stop = true;
      }
      break;
    case 'lobbyReady':
      {
        if (playerNr != 0) {
          readyHTML.innerHTML = 'Keer terug naar de kamer';
          lobbyReady = true;
        }
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
            roomInfo.players.splice(player);
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
  console.log('connecting to ' + host);
  console.log('mqqtt id: ', playerId);
  mqtt = new Paho.MQTT.Client(host, Number(port), playerId);
  let options = {
    timeout: 0,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};
