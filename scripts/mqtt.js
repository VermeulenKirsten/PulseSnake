let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;

const onConnect = function() {
  console.log('Connected');
  mqtt.subscribe(roomInfo.roomId);
  beginGame();
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  // console.log('message:', msg.payloadString);
  message = JSON.parse(msg.payloadString);
  switch (message.type) {
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
            // console.log('this snake got replaced', snakes[t]);
          }
        }
      }
      break;
    case 'fruit':
      {
        // console.log('fruit  message received ');
        // console.log  (message.message);
        fruit = message.message;
        //show the fruit
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(fruit[1] * scalefactor, fruit[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
      }
      break;
    case 'candy':
      {
        // console.log('candy message received ');
        // console.log(message.message);
        candy = message.message;
        // show the candy
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(candy[1] * scalefactor, candy[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
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
