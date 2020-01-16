let playerId;
let playerList;
let playerRole;
let domStart;
let nameInput;

// ***********  initiate game ***********

const goToGame = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('startGame', { roomInfo: roomInfo })));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
  // mqtt.send('0001', '{"test":"sdf"}', 1, false);
  sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
  console.log(roomInfo);
  window.location.href = 'game.html';
};
// ***********  show players in loby ***********

const showplayers = function() {
  let output = '';
  for (player of roomInfo.players) {
    output += `<li>${player.name}</li>`;
    if (player.id == playerId) {
      nameInput.value = player.name;
    }
  }
  playerList.innerHTML = output;
};
// ***********  make a room and let people join ***********

const loadRoomInfo = function() {
  playerId = sessionStorage.getItem('playerId');
  oldRoom = JSON.parse(sessionStorage.getItem('roomInfo'));
  roomInfo = new room(oldRoom.roomId);
  roomInfo.players = oldRoom.players;
  roomInfo.defaultSpeed = oldRoom.defaultSpeed;
  roomInfo.gameDuration = oldRoom.gameDuration;
  MQTTconnect(onConnect);
  showplayers();

  document.querySelector('.js-roomid').innerHTML = roomInfo.roomId;
};
// ***********  add eventlistener to submit button and generate room ***********

const addListener = function() {
  console.log(playerRole);

  if (playerRole == 'Host') {
    domStart.addEventListener('click', goToGame);
  }
  domBack.addEventListener('click', goToCreate);
  nameInput.addEventListener('blur', updateName);
};

const updateName = function() {
  let localPlayer;
  for (let player of roomInfo.players) {
    if (player.id == playerId) {
      localPlayer = player;
      localPlayer.name = nameInput.value;
    }
  }
  let message = new Paho.MQTT.Message(JSON.stringify(new Message('playerUpdate', localPlayer)));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};

// ***********  Navigation ***********
const goToCreate = function() {
  window.location.href = 'create.html';
};

// ***********  generate dom elements ***********

const generateDOMelements = function() {
  playerList = document.querySelector('#playerListjs');
  nameInput = document.querySelector('.js-naam');
  domBack = document.querySelector('.js-back');
  if (playerRole == 'Host') {
    domStart = document.querySelector('.js-startGame');
  }
};

const init = function() {
  var url = new URL(window.location.href);
  roomId = url.searchParams.get('roomId');
  if (roomId) {
    playerRole = 'Guest';
    playerId = createUuid();
    MQTTconnect(onConnectGuest);
    generateDOMelements();
    addListener();
    document.querySelector('.js-roomid').innerHTML = roomId;
  } else {
    playerRole = 'Host';
    generateDOMelements();
    addListener();

    loadRoomInfo();
  }
};

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

document.addEventListener('DOMContentLoaded', init);
