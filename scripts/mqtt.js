let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let loadedPlayers = {};

const onConnect = function() {
  console.log('Connected');
  console.log(roomInfo);
  mqtt.subscribe(roomInfo.roomId);

  message = new Paho.MQTT.Message(JSON.stringify(new Message('playerLoaded', playerId)));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
  console.log('message send');
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
          console.log(loadedPlayers);
          console.log(new Set(Object.values(loadedPlayers)).size === 1);
          if (new Set(Object.values(loadedPlayers)).size === 1) {
            console.log('all players are loaded');

            message = new Paho.MQTT.Message(JSON.stringify(new Message('startGame', '')));
            message.destinationName = roomInfo.roomId;
            mqtt.send(message);
          }
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
            //snakes[t].Tail = message.message.Tail;
            snakes[t].Color = message.message.Color;
            snakes[t].Inputbuffer = message.message.Inputbuffer;
            snakes[t].Isalive = message.message.Isalive;
            // console.log('this snake got replaced', snakes[t]);
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
        console.log('gameOver message received ', message.message);
        console.log('spel gedaan:' + message.message.snake.Name + 'heeft' + message.message.method);
        document.querySelector('.js-gameOver').innerHTML += `spel gedaan: ${message.message.snake.Name} ${
          message.message.method == 'ate himself' ? 'heeft zichzelf opgegeten' : 'is van het spelboard gegaan'
        }<br>`;
        document.querySelector('.js-lobby').style.display = 'block';
      }
      break;
    case 'lobbyReady':
      {
        lobbyButton.style.display = 'block';
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
