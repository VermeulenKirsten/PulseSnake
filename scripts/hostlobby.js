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
    output += `<li>${player.name} - ${player.ready ? 'klaar' : 'niet klaar'}</li>`;
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
  for (let player in roomInfo.players) {
    if (roomInfo.players[player].id == playerId) {
      roomInfo.players[player].ready = true;
      nameInput.value = player.name;
    }
  }

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
    domStart.addEventListener('click', readyUp);
    domBack.addEventListener('click', goToJoin);
  }
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
};

// ***********  Navigation ***********
const goToCreate = function() {
  console.log('craeet');
  window.location.href = 'create.html';
};

const goToJoin = function() {
  console.log('craeet');
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
  domStart = document.querySelector('.js-startGame');
};
// ***********  init ***********

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
        nameInput.value = localPlayer.name;
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
