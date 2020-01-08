let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let roomcode;
let roomInfo;

const checkGame = function() {
  if (roomId) {
  }
};

const onConnect = function() {
  console.log('Connected');
  mqtt.subscribe(roomId);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
  let player = JSON.parse(msg.payloadString);
  if (roomInfo.player.length < 4) {
    roomInfo.players.push(player);
    message = new Paho.MQTT.Message(JSON.stringify(roomInfo));
    message.destinationName = roomId;
    mqtt.send(message);
  } else {
    console.log('room full');
  }
  console.log(roomInfo);
};

const MQTTconnect = function(name) {
  console.log('connecting to ' + host);
  console.log(typeof name);
  mqtt = new Paho.MQTT.Client(host, Number(port), name);
  let options = {
    timeout: 0,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};
