let playerId;
let playerNr;
let roomInfo;

let stop = false;
let snakes = [];
let fruit = [null, null];
let candy = [null, null];
let canvas;
let ctx;
let gamewidth = 800;
let gameheight = 800;
let scalefactor = 40;
let newsnake;

let snakePositions = [
  [
    [6, 3],
    [6, 2],
    [6, 1]
  ],
  [
    [9, 3],
    [9, 2],
    [9, 1]
  ],
  [
    [12, 3],
    [12, 2],
    [12, 1]
  ],
  [
    [15, 3],
    [15, 2],
    [15, 1]
  ]
];
let snakeColors = ['#00FF00', '#FF0000', '#0000FF', '#00FFFF'];

// ***********  DOM references ***********
const getdomelements = function() {
  canvas = document.querySelector('.c-gameboard');
  ctx = canvas.getContext('2d');

  //needs to be moved
  document.querySelector('.js-lobby').addEventListener('click', function() {
    if (playerNr != 0) {
      message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
      message.destinationName = roomInfo.roomId;
      mqtt.send(message);
      window.location.href = 'playerroom.html?roomId=' + roomInfo.roomId;
    } else {
      window.location.href = 'hostlobby.html';
    }
  });
};

// ***********  HTML Generation ***********

// ***********  Callback ***********

// ***********  Data Access ***********

// ***********  Objects ***********

// ***********  Event Listeners ***********
//event that triggers when keyboard buttons are pressed
const handlekeydowns = function() {
  playerNr = 0;
  document.addEventListener('keydown', function(key) {
    // console.log('key pressed');
    // console.log(playerNr);
    // console.log(snakes[playerNr]);
    //left arrow key pressed
    if (key.which === 37) {
      newsnake.Input('left');
    }
    //up arrow key pressed
    else if (key.which === 38) {
      newsnake.Input('up');
    }
    //right arrow key pressed
    else if (key.which === 39) {
      newsnake.Input('right');
    }
    //down arrow key pressed
    else if (key.which === 40) {
      newsnake.Input('down');
    } else if (key.which === 32) {
      newsnake.Input('slow');
    }

    //space bar pressed
  });
};

// ***********  Core Game Mechanics ***********
const createfield = function() {
  ctx.clearRect(0, 0, gamewidth, gameheight);
};

const displaysnake = function(snakeobj) {
  createfield();
  snakeobj.Movesnake();

  try {
    for (let piece of snakeobj.Tail) {
      console.log('okj');
      ctx.fillStyle = snakeobj.Color;
      ctx.fillRect(piece[1] * scalefactor, piece[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
    }
  } catch {
    snakeobj.isalive = false;
    console.log('u dead boi');
    stop = true;
  }
  if (!stop) {
    setTimeout(function() {
      displaysnake(snakeobj);
    }, 100 * snakeobj.Speed);
  }
};

const getSessionData = function() {
  playerId = sessionStorage.getItem('playerId');
  roomInfo = JSON.parse(sessionStorage.getItem('roomInfo'));
  let startTime = sessionStorage.getItem('startTime');
  console.log(playerId);
  console.log(roomInfo);
  MQTTconnect();
};

const beginGame = function() {
  console.log('begin the game');
  console.log(roomInfo);

  newsnake = new Snake(roomInfo.players[0].name, roomInfo.players[0].id, snakePositions[0], 'right', 6, snakeColors[0]);
  console.log(newsnake);
  handlekeydowns();
  displaysnake(newsnake);
  //setTimeout(start, 1000);
};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  // getdomelements();
  // createfield();
  getdomelements();
  getSessionData();

  //generateSnakes();
  // beginGame;
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
