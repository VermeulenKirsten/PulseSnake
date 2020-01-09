let playerId;
let playerList;
let buttonStart;
// ***********  initiate game ***********

const startGame = function() {
  let startTime = new Date(Date.now() + 10000).getTime();
  message = new Paho.MQTT.Message(JSON.stringify(new Message('startGame', { startTime: startTime, roomInfo: roomInfo })));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
  // mqtt.send('0001', '{"test":"sdf"}', 1, false);
  sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
  sessionStorage.setItem('startTime', startTime);
  console.log(roomInfo);
  //window.location.href = 'game.html';
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
  buttonStart.addEventListener('click', startGame);
};

// ***********  generate dom elements ***********

const generateDOMelements = function() {
  playerList = document.querySelector('#playerListjs');
  buttonStart = document.querySelector('.js-startGame');
};

const init = function() {
  generateDOMelements();
  addListener();
  loadRoomInfo();
};

document.addEventListener('DOMContentLoaded', init);
