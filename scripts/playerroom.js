let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;

let roomId;
let playerId;
// let playerName;
let playerList;
let roominfo = null;

window.onbeforeunload = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
  message.destinationName = roomId;
  mqtt.send(message);
};

const roomNotFound = function() {
  if (roominfo == null) {
    console.log('room not found, redirecting');
    window.location.href = 'join.html?error=roomNotFound';
  }
};

//mqtt
const onConnect = function() {
  console.log('Connected');
  mqtt.subscribe(roomId);
  let guest = new Player(playerId);
  console.log('send: ', JSON.stringify(new Message('player', guest)));
  message = new Paho.MQTT.Message(JSON.stringify(new Message('player', guest)));
  message.destinationName = roomId;
  mqtt.send(message);

  setTimeout(roomNotFound, 3000);
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
    case 'error': {
      // message: {"type":"error","message":{"toId":"884203de-c6b6-41c9-92ad-c7c473773ed3","message":"room full"}}
      if (message.message.errorMessage == 'room full' && message.message.toId == playerId) {
        console.log('room is full redirecting');
        window.location.href = 'join.html?error=roomFull';
      }
      console.log(message.message);
    }
    default:
      console.log('nonexisting type');
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

  playerId = createUuid();

  //   playerName = url.searchParams.get('playerName');
  console.log(roomId, playerId);

  getDomelements();
  MQTTconnect();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
