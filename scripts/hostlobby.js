let playerId;
let playerList;
let buttonStart;
// ***********  initiate game ***********

const startGame = function() {
  console.log('start');
  //   message = new Paho.MQTT.Message(JSON.stringify(roomInfo));
  //   message.destinationName = '0000';
  //   mqtt.send('0001', '{"test":"sdf"}', 1, false);
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
  MQTTconnect('0001');
  showplayers();
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
