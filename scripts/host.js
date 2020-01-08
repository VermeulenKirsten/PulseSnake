let roomId = '';
let name;
let form;
const generateRoom = function() {
  MQTTconnect(name.value);
  let host = new Player(name.value);
  roomInfo = new room(roomId);
  roomInfo.players.push(host);
  console.table(roomInfo);
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
  name = document.querySelector('.js-name');
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
