let playerId;
let playerList;
let playerRole;
let domStart;
let nameInput;
let htmlLeave;
let first = true;
let playerNr;

// ***********  initiate game ***********

const goToGame = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('startGame', { roomInfo: roomInfo })));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
  sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
  window.location.href = 'game.html';
};
// ***********  show players in loby ***********

const showplayers = function() {
  let output = '';
  for (player of roomInfo.players) {
    switch (player.color) {
      case '#FF0000':
        head = './img/png/red_head.png';
        break;
      case '#00FF00':
        head = './img/png/green_head.png';
        break;
      case '#0000FF':
        head = './img/png/blue_head.png';
        break;
      case '#FFFF00':
        head = './img/png/yellow_head.png';
        break;
    }
    output += `<li class="o-layout__center c-lobby__player">
    <img class="c-lobby__img-sm" src="${head}" alt="Hoofdje" />
    <p class="u-mb-clear">${player.name}</p>
    ${
      player.ready
        ? '<svg aria-hidden="true" focusable="false" class="c-icon c-lobby__ready" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path  d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>'
        : '<svg aria-hidden="true" focusable="false" class="c-icon c-lobby__not-ready" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>'
    }
  </li>`;
  }
  playerList.innerHTML = output;
};
// ***********  update name in input field ***********
const updateNameInput = function() {
  if (first) {
    for (player of roomInfo.players) {
      if (player.id == playerId) {
        nameInput.value = player.name;
      }
    }
    first = false;
  }
};

const updateSnakeColor = function() {
  for (let player of roomInfo.players) {
    if (player.id == playerId) {
      switch (player.color) {
        case '#FF0000':
          document.querySelector('.js-snake').src = 'img/png/red_snake.png';
          break;
        case '#00FF00':
          document.querySelector('.js-snake').src = 'img/png/green_snake.png';
          break;
        case '#0000FF':
          document.querySelector('.js-snake').src = 'img/png/blue_snake.png';
          break;
        case '#FFFF00':
          document.querySelector('.js-snake').src = 'img/png/yellow_snake.png';
          break;
      }
    }
  }
};

// ***********  make a room and let people join ***********

const loadRoomInfo = function() {
  playerId = sessionStorage.getItem('playerId');
  oldRoom = JSON.parse(sessionStorage.getItem('roomInfo'));
  roomInfo = new room(oldRoom.roomId);
  roomInfo.colors = oldRoom.colors;
  roomInfo.players = oldRoom.players;
  roomInfo.defaultSpeed = oldRoom.defaultSpeed;
  roomInfo.gameDuration = oldRoom.gameDuration;
  for (let player in roomInfo.players) {
    if (roomInfo.players[player].id == playerId) {
      nameInput.value = player.name;
    }
  }

  MQTTconnect(onConnect);
  showplayers();

  document.querySelector('.js-roomid').innerHTML = roomInfo.roomId;
};

// ***********  add eventlistener to submit button and generate room ***********

const addListener = function() {

  if (playerRole == 'Host') {
    domStart.addEventListener('click', goToGame);
    domBack.addEventListener('click', goToCreate);
  } else {
    domStart.addEventListener('click', readyUp);
    domBack.addEventListener('click', goToJoin);
  }
  nameForm.addEventListener('submit', updateName);
  save.addEventListener('click', updateName);
  nameInput.addEventListener('blur', updateName);
  nameInput.addEventListener('focus', clearName);
};
// ***********  toggle player status ***********

const readyUp = function() {
  message = new Paho.MQTT.Message(JSON.stringify(new Message('playerReady', playerId)));
  message.destinationName = roomId;
  mqtt.send(message);
};
// ***********  update the name in the room ***********

const clearName = function() {
  nameInput.value = '';
};

const updateName = function() {
  if (nameInput.value == '') {
    for (let player of roomInfo.players) {
      if (player.id == playerId) {
        nameInput.value = player.name;
      }
    }
  } else {
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
  }
  document.activeElement.blur();
};

// ***********  Navigation ***********
const goToCreate = function() {
  sessionStorage.clear();
  window.location.href = 'create.html';
};

const goToJoin = function() {
  window.location.href = 'join.html';
  message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
  message.destinationName = roomId;
  mqtt.send(message);

  sessionStorage.clear();
};
// ***********  set the right html acording to role ***********

const setHTML = function(role) {
  if (role == 'Guest') {
    startGameTekst.innerHTML = 'Klaar';
  } else {
    domStart.style.display = 'none';
  }
  domBack = document.querySelector('.js-back');
};

// ***********  generate dom elements ***********

const generateDOMelements = function() {
  console.log('dom');
  playerList = document.querySelector('.js-players');
  nameInput = document.querySelector('.js-name').children[0];
  startGameTekst = document.querySelector('.js-startGameTekst');
  domBack = document.querySelector('.js-back');
  save = document.querySelector('.js-save');
  domStart = document.querySelector('.js-startGame');
  nameForm = document.querySelector('.js-name');
};
// ***********  init ***********

const init = function() {
  var url = new URL(window.location.href);
  roomId = url.searchParams.get('roomId');
  if (roomId) {
    playerRole = 'Guest';
    playerId = createUuid();
    MQTTconnect(onConnectGuest);
    setTimeout(roomNotFound, 5000);
    generateDOMelements();
    setHTML('Guest');
    addListener();
    document.querySelector('.js-roomid').innerHTML = roomId;
  } else {
    playerRole = 'Host';
    generateDOMelements();
    setHTML('Host');
    addListener();
    loadRoomInfo();
    updateSnakeColor();
    updateNameInput();
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
