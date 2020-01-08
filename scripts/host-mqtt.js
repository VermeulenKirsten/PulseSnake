let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;
let roomInfo;

const checkGame = function() {
  if (roomId) {
  }
};

const onConnect = function() {
  console.log('Connected');
  let suboptions = {
    qos: 1
  };
  mqtt.subscribe('0001', suboptions);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log('message:', msg.payloadString);
  let incommingMessage = JSON.parse(msg.payloadString);
  if (incommingMessage.type == 'player') {
    if (roomInfo.players.length < 4) {
      let count = 0;
      for (player of roomInfo.players) {
        console.log(player);
        if (player.name == newplayer.name) {
          count++;
        }
      }
      if (count == 0) {
        roomInfo.players.push(newplayer);
        message = new Paho.MQTT.Message(new Message('roominfo', JSON.stringify(roomInfo)));
        message.destinationName = '0001';
        mqtt.send(message);
      } else {
        message = new Paho.MQTT.Message(new Message('error', 'Name already used'));
        message.destinationName = '0001';
        mqtt.send(message);
      }
    } else {
      message = new Paho.MQTT.Message(new Message('error', 'room full'));
      message.destinationName = '0001';
      mqtt.send(message);
    }
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
