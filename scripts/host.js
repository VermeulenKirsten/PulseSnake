let roomId = '';
let form;
let speed;
let duration;
let lessTime;
let moreTime;
let lessSpeed;
let moreSpeed;
let durationTime = 5;
let moreTimeTimer;
let lessTimeTimer;
let mouseDownMore;
let speedOptions = { 'Heel traag': 6, Traag: 5, Normaal: 4, Snel: 3.5, 'Heel snel': 3 };
let currentSpeedOption = 2;

// ***********  generate room ***********
const generateRoom = function() {
  playerId = createUuid();
  let host = new Player(playerId);
  host.name = 'Speler 1';
  roomInfo = new room(roomId);
  roomInfo.addPlayer(host);
  roomInfo.defaultSpeed = speedOptions[Object.keys(speedOptions)[currentSpeedOption]];
  roomInfo.gameDuration = durationTime;

  //store gameinfo in sessionstorage and go to lobby

  sessionStorage.setItem('playerId', playerId);
  sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
  window.location.href = 'hostlobby.html';
};
// ***********  add eventlistener to submit button and generate room ***********

const addListener = function() {
  form.addEventListener('submit', generateRoom);
  lessTime.addEventListener('mousedown', startLessTime);
  lessTime.addEventListener('mouseup', stopLessTime);
  moreTime.addEventListener('mousedown', startMoreTime);
  moreTime.addEventListener('mouseup', stopMoreTime);
  lessSpeed.addEventListener('click', removeSpeed);
  moreSpeed.addEventListener('click', addSpeed);
};
// ***********  generate a roomId ***********

const generateRoomId = function() {
  for (let i = 1; i <= 4; i++) {
    roomId += Math.floor(Math.random() * 10);
  }
};
const addSpeed = function() {
  currentSpeedOption = currentSpeedOption == Object.keys(speedOptions).length - 1 ? currentSpeedOption : currentSpeedOption + 1;
  speed.value = Object.keys(speedOptions)[currentSpeedOption];
};
const removeSpeed = function() {
  currentSpeedOption = currentSpeedOption == 0 ? currentSpeedOption : currentSpeedOption - 1;
  speed.value = Object.keys(speedOptions)[currentSpeedOption];
};
const startLessTime = function() {
  mouseDownLess = true;
  durationTime = durationTime == 1 ? 1 : durationTime - 1;
  if (durationTime == 1) {
    duration.value = durationTime + ' minuut';
  } else {
    duration.value = durationTime + ' minuten';
  }

  setTimeout(fastLessTime, 500);
};

const fastLessTime = function() {
  if (mouseDownLess) {
    durationTime = durationTime == 1 ? 1 : durationTime - 1;
    if (durationTime == 1) {
      duration.value = durationTime + ' minuut';
    } else {
      duration.value = durationTime + ' minuten';
    }
    if (mouseDownLess) {
      setTimeout(fastLessTime, 50);
    }
  }
};
const stopLessTime = function() {
  mouseDownLess = false;
};
const startMoreTime = function() {
  mouseDownMore = true;
  durationTime = durationTime == 99 ? 99 : durationTime + 1;
  duration.value = durationTime + ' minuten';
  setTimeout(fastMoreTime, 500);
};

const fastMoreTime = function() {
  if (mouseDownMore) {
    durationTime = durationTime == 99 ? 99 : durationTime + 1;
    duration.value = durationTime + ' minuten';
    if (mouseDownMore) {
      setTimeout(fastMoreTime, 50);
    }
  }
};

const stopMoreTime = function() {
  mouseDownMore = false;
};

// ***********  generate dom elements ***********

const generateDOMelements = function() {
  form = document.querySelector('.js-form');
  speed = document.querySelector('.js-speed');
  speed.value = Object.keys(speedOptions)[currentSpeedOption];

  duration = document.querySelector('.js-time');
  duration.value = durationTime + ' minuten';
  lessTime = document.querySelector('.js-lessTime');
  moreTime = document.querySelector('.js-moreTime');
  lessSpeed = document.querySelector('.js-lessSpeed');
  moreSpeed = document.querySelector('.js-moreSpeed');
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
