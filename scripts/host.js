let roomId = '';
let form;

// ***********  generate room ***********
const generateRoom = function() {
  playerId = createUuid();
  let host = new Player(playerId);
  host.name = 'Speler 1';
  roomInfo = new room(roomId);
  roomInfo.addPlayer(host);

  //store gameinfo in sessionstorage and go to lobby
  sessionStorage.setItem('playerId', playerId);
  sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
  window.location.href = 'http://127.0.0.1:5500/hostlobby.html';
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
