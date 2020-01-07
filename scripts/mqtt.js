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
  snakemessage = JSON.parse(msg.payloadString);
  for (let t = 0; t < snakes.length; t++) {
    if (snakes[t].Name == snakemessage.Name) {
      snakes[t].Id = snakemessage.Id;
      snakes[t].Name = snakemessage.Name;
      snakes[t].Speed = snakemessage.Speed;
      snakes[t].Tail = snakemessage.Tail;
      snakes[t].Color = snakemessage.Color;
      snakes[t].Inputbuffer = snakemessage.Inputbuffer;
      snakes[t].Isalive = snakemessage.Isalive;
      console.log('this snake got replaced', snakes[t]);
    }
  }
};

const MQTTconnect = function() {
  console.log('connecting to ' + host);
  mqtt = new Paho.MQTT.Client(host, Number(port), 'robbe');
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
