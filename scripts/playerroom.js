let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;

let roomId;
let playerId;
let playerList;
let roomInfo;
// ***********  page reload ***********

window.onbeforeunload = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
  message.destinationName = roomId;
  mqtt.send(message);
};
// ***********  room doesn't exist ***********

const roomNotFound = function() {
  if (!roomInfo) {
    window.location.href = 'join.html?error=roomNotFound';
  }
};

// ***********  when succesfully connected to broker ***********

const onConnect = function() {
  mqtt.subscribe(roomId);
  let guest = new Player(playerId);
  message = new Paho.MQTT.Message(JSON.stringify(new Message('player', guest)));
  message.destinationName = roomId;
  mqtt.send(message);

  setTimeout(roomNotFound, 3000);
};

// ***********  not succesfully connected to broker ***********

const onFailure = function() {
  console.log('connection lost, reconnecting');
  setTimeout(MQTTconnect, reconnectTimeout);
};

// ***********  when a message arrives ***********

const onMessageArrived = function(msg) {
  let message = JSON.parse(msg.payloadString);
  switch (message.type) {
    case 'roomInfo':
      {
        console.log('roomInfo received');
        roomInfo = message.message;
        console.log('roominfo', roomInfo);
        showplayers(roomInfo);
      }
      break;
    case 'startGame':
      {
        roomInfo = JSON.stringify(message.message.roomInfo);
        sessionStorage.setItem('roomInfo', roomInfo);
        sessionStorage.setItem('startTime', message.message.startTime);
        sessionStorage.setItem('playerId', playerId);
        console.log('startgame received', message);
        window.location.href = 'game.html';
      }
      break;
    case 'error':
      {
        if (message.message.errorMessage == 'room full' && message.message.toId == playerId) {
          console.log('room is full redirecting');
          window.location.href = 'join.html?error=roomFull';
        }
        console.log(message.message);
      }
      break;
    default:
      console.log('nonexisting type:', message.type);
  }
};

// ***********  connect to broker ***********

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

// ***********  Show connected players in html ***********

const showplayers = function(roomInfo) {
  console.log(roomInfo);
  let output = '';
  for (player of roomInfo.players) {
    output += `<li>${player.name}</li>`;
  }
  playerList.innerHTML = output;
};
// ***********  generate dom elements ***********

const getDomelements = function() {
  playerList = document.querySelector('#playerListjs');
};

// ***********  init ***********

const init = function() {
  var url = new URL(window.location.href);
  roomId = url.searchParams.get('roomId');

  playerId = createUuid();

  getDomelements();
  MQTTconnect();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
