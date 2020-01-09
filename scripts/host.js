let roomId = '';
let form;

// ***********  generate room ***********
const generateRoom = function() {
  playerId = createUuid();
  let host = new Player(playerId);
  host.name = 'Speler 1';
  roomInfo = new room(roomId);
  roomInfo.addPlayer(host);
  roomInfo.defaultSpeed = speed.value;
  roomInfo.gameDuration = duration.value;
  //store gameinfo in sessionstorage and go to lobby
  sessionStorage.setItem('playerId', playerId);
  sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
  window.location.href = 'hostlobby.html';
};
// ***********  add eventlistener to submit button and generate room ***********

const addListener = function() {
  form.addEventListener('submit', generateRoom);
};
// ***********  generate a roomId ***********

const generateRoomId = function() {
  for (let i = 1; i <= 4; i++) {
    roomId += Math.floor(Math.random() * 10);
  }
  document.querySelector('.js-roomid').innerHTML = roomId;
};

// ***********  generate dom elements ***********

const generateDOMelements = function() {
  form = document.querySelector('.js-form');
  speed = document.querySelector('.js-speed');
  duration = document.querySelector('.js-time');
  addListener();
};

// ***********  init ***********

const init = function() {
  generateDOMelements();
  generateRoomId();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
