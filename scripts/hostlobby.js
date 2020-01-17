let playerId;
let playerList;
let playerRole;
let domStart;
let nameInput;
let htmlLeave;

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
    domBack.addEventListener('click', goToCreate);
  } else {
    domBack.addEventListener('click', goToJoin);
  }
  domBack.addEventListener('click', goToCreate);
  save.addEventListener('click', updateName);
  nameInput.addEventListener('blur', updateName);
  nameInput.addEventListener('focus', clearName);
};
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
};

// ***********  Navigation ***********
const goToCreate = function() {
  console.log('craeet');
  window.location.href = 'create.html';
};
const goToJoin = function() {
  console.log('craeet');
  window.location.href = 'join.html';
};

const setHTML = function(role) {
  if (role == 'Guest') {
    startGameTekst.innerHTML = 'Klaar';
  }
  domBack = document.querySelector('.js-back');
};

// ***********  generate dom elements ***********

const generateDOMelements = function() {
  console.log('dom');
  playerList = document.querySelector('#playerListjs');
  nameInput = document.querySelector('.js-naam');
  startGameTekst = document.querySelector('.js-startGameTekst');
  domBack = document.querySelector('.js-back');
  save = document.querySelector('.js-save');
  if (playerRole == 'Host') {
    domStart = document.querySelector('.js-startGame');
  }
};

const init = function() {
  var url = new URL(window.location.href);
  roomId = url.searchParams.get('roomId');
  if (roomId) {
    playerRole = 'Guest';
    if (sessionStorage.getItem('player')) {
      localPlayer = JSON.parse(sessionStorage.getItem('player'));
      oldRoom = JSON.parse(sessionStorage.getItem('roomInfo'));
      let oldroomId = oldRoom.roomId;
      playerId = localPlayer.id;

      if (roomId == oldroomId) {
        old = true;
      } else {
        old = false;
        playerId = createUuid();
      }
    } else {
      old = false;
      playerId = createUuid();
    }
    MQTTconnect(onConnectGuest);
    generateDOMelements();
    setHTML('Guest');
    addListener();
    document.querySelector('.js-roomid').innerHTML = roomId;
  } else {
    setHTML('Host');
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
