let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let roomcode;

const onConnect = function() {
  console.log('Connected');
  mqtt.subscribe(roomcode);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
  message = JSON.parse(msg.payloadString);
  switch (message.type) {
    case 'snake': {
      for (let t = 0; t < snakes.length; t++) {
        if (snakes[t].Id == message.Id) {
          snakes[t].Name = message.Name;
          snakes[t].Speed = message.Speed;
          snakes[t].Tail = message.Tail;
          snakes[t].Color = message.Color;
          snakes[t].Inputbuffer = message.Inputbuffer;
          snakes[t].Isalive = message.Isalive;
          console.log('this snake got replaced', snakes[t]);
        }
      }
    }
    default: {
      console.log('unknown message');
    }
  }
};

const MQTTconnect = function() {
  console.log('connecting to ' + host);
  mqtt = new Paho.MQTT.Client(host, Number(port), playerId);
  let options = {
    timeout: 0,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};

document.addEventListener('DOMContentLoaded', function() {
  roomcode = 'ktest';
  MQTTconnect();
});
