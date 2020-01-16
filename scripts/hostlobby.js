let playerId;
let playerList;
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
  MQTTconnect(playerId);
  showplayers();

  document.querySelector('.js-roomid').innerHTML = roomInfo.roomId;
};
// ***********  add eventlistener to submit button and generate room ***********

const addListener = function() {
  domStart.addEventListener('click', goToGame);
  domBack.addEventListener('click', goToCreate);
  nameInput.addEventListener('blur', updateName);
};

const updateName = function() {
  let localPlayer;
  for (let player of roomInfo.players) {
    if (player.id == playerId) {
      player.name = nameInput.value;
      localPlayer = player;
    }
  }
  let newMessage = new Message('playerUpdate', localPlayer);
  let message = new Paho.MQTT.Message(JSON.stringify(newMessage));
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
  domStart = document.querySelector('.js-startGame');
  domBack = document.querySelector('.js-back');
  nameInput = document.querySelector('.js-naam');
};

const init = function() {
  generateDOMelements();
  addListener();
  loadRoomInfo();
};

document.addEventListener('DOMContentLoaded', init);
