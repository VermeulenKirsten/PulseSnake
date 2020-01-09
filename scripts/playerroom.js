let mqtt;
let reconnectTimeout = 100;
let host = 'mct-mqtt.westeurope.cloudapp.azure.com';
let port = 80;

let roomId;
let playerId;
// let playerName;
let playerList;
let roomInfo;

window.onbeforeunload = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
  message.destinationName = roomId;
  mqtt.send(message);
};

const roomNotFound = function() {
  if (!roomInfo) {
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
    case 'roomInfo':
      {
        console.log('roomInfo received');
        roomInfo = message.message;
        console.log('roominfo', roomInfo);
        showplayers(roomInfo);
      }
      break;
    // {"type":"startGame","message":{"startTime":1578565869942,"roomInfo":{"roomId":"6039","players":[{"id":"6f19fc4a-cd28-4180-8ee8-544aedc8d3c9","color":"#FF0000","name":"Speler 1"},{"id":"f44f189a-f1c7-4e61-a9c1-b3437f35ed7e","color":"#FF0000","name":"Speler 2"}],"maxplayers":4}}}
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
        // message: {"type":"error","message":{"toId":"884203de-c6b6-41c9-92ad-c7c473773ed3","message":"room full"}}
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
const showplayers = function(roomInfo) {
  console.log(roomInfo);
  let output = '';
  for (player of roomInfo.players) {
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
