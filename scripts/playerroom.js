let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;

let roomId;
let playerName;
let playerList;

window.onbeforeunload = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerName)));
  message.destinationName = roomId;
  mqtt.send(message);
};

//mqtt
const onConnect = function() {
  console.log('Connected');
  //   mqtt.subscribe(roomId);
  mqtt.subscribe('0001');
  console.log;
  let player = new Player(playerName);
  console.log('send: ', JSON.stringify(new Message('player', player)));
  message = new Paho.MQTT.Message(JSON.stringify(new Message('player', player)));
  message.destinationName = roomId;
  mqtt.send(message);
};

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

const onMessageArrived = function(msg) {
  console.log(msg);
  console.log('message:', msg.payloadString);
  let message = JSON.parse(msg.payloadString);
  console.log(message);
  switch (message.type) {
    case 'roominfo': {
      console.log('roominfo received');
      roominfo = message.message;
      showplayers(roominfo);
    }
    default:
      console.log('nonexisting type');
  }
};

const MQTTconnect = function() {
  console.log('connecting to ' + host);
  mqtt = new Paho.MQTT.Client(host, Number(port), playerName);
  let options = {
    timeout: 0,
    onSuccess: onConnect,
    onFailure: onFailure
  };
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options);
};
const showplayers = function(roominfo) {
  console.log(roominfo);
  let output = '';
  for (player of roominfo.players) {
    output += `<li>${player.name}</li>`;
  }
  playerList.innerHTML = output;
};

const getDomelements = function() {
  playerList = document.querySelector('#playerListjs');
};

const init = function() {
  var url = new URL(window.location.href);
  roomId = url.searchParams.get('roomId');
  playerName = url.searchParams.get('playerName');
  console.log(roomId, playerName);

  getDomelements();
  MQTTconnect();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
