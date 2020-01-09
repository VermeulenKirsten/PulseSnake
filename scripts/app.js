let playerId;
let playerNr;
let roomInfo;

let stop = false;
let snakes = [];
let fruit = [null, null];
let candy = [null, null];
let canvas;
let ctx;
let gamewidth = 500;
let gameheight = 500;
let scalefactor = 20;

let snakePositions = [
  [
    [3, 0],
    [2, 0],
    [1, 0]
  ],
  [
    [4, 5],
    [5, 5],
    [6, 5]
  ],
  [
    [4, 5],
    [5, 5],
    [6, 5]
  ],
  [
    [3, 5],
    [2, 5],
    [1, 5]
  ]
];
let snakeColors = ['#00FF00', '#FF0000', '#0000FF', '#00FFFF'];

// ***********  DOM references ***********
const getdomelements = function() {
  canvas = document.querySelector('.c-gameboard');
  ctx = canvas.getContext('2d');
};

// ***********  HTML Generation ***********

// ***********  Callback ***********

// ***********  Data Access ***********
const handleData = async function(url, callback, method = 'GET', body = null) {
  const get = await fetch(url, { method: method, body: body, headers: { 'content-type': 'application/json' } });
  const json = await get.json();
  callback(json);
};

// ***********  Objects ***********

// ***********  Event Listeners ***********
//event that triggers when keyboard buttons are pressed
const handlekeydowns = function() {
  document.addEventListener('keydown', function(key) {
    console.log('key pressed');
    console.log(playerNr);
    console.log(snakes[playerNr]);
    //left arrow key pressed
    if (key.which === 37) {
      snakes[playerNr].Input('left');
    }
    //up arrow key pressed
    else if (key.which === 38) {
      snakes[playerNr].Input('up');
    }
    //right arrow key pressed
    else if (key.which === 39) {
      snakes[playerNr].Input('right');
    }
    //down arrow key pressed
    else if (key.which === 40) {
      snakes[playerNr].Input('down');
    }
    //space bar pressed
    else if (key.which === 32) {
      if (stop) {
        stop = false;
      } else {
        stop = true;
      }
      gametick();
    }
  });
};

// ***********  Core Game Mechanics ***********
const createfield = function() {
  ctx.clearRect(0, 0, gamewidth, gameheight);
};

const displaysnake = function(snakeobj) {
  // console.log('snakeopbject: ', snakeobj);
  try {
    for (let piece of snakeobj.Tail) {
      ctx.fillStyle = snakeobj.Color;
      ctx.fillRect(piece[1] * scalefactor, piece[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
    }
  } catch {
    snakeobj.isalive = false;
    console.log('u dead boi');
    stop = true;
  }
};
const gametick = function() {
  // create empty field where we can re-draw everything
  createfield();

  // show the fruit we created before
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(fruit[1] * scalefactor, fruit[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
  // show the candy
  ctx.fillStyle = '#FF00FF';
  ctx.fillRect(candy[1] * scalefactor, candy[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);

  // move the snake
  for (let player of snakes) {
    player.Movesnake();
  }

  //display the snake
  for (let player of snakes) {
    displaysnake(player);
  }
  if (!stop) {
    setTimeout(gametick, 200);
  }
};

// ***********  generate fruit ***********
const generatefruit = function() {
  x = Math.ceil((Math.random() * gamewidth) / scalefactor - 1);
  y = Math.ceil((Math.random() * gameheight) / scalefactor - 1);
  console.log('x: ', x, ' y: ', y);
  if (candy[0] != x && candy[1] != y)
    for (let player of snakes) {
      for (tailpiece of player.Tail) {
        if (tailpiece[0] == x && tailpiece[1] == y) {
          generatefruit();
          break;
        }
      }
    }
  fruit = [y, x];
  let fruitmessage = new Message('fruit', fruit);
  let message = new Paho.MQTT.Message(JSON.stringify(fruitmessage));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};
// ***********  generate candy ***********
const generatecandy = function() {
  x = Math.ceil((Math.random() * gamewidth) / scalefactor - 1);
  y = Math.ceil((Math.random() * gameheight) / scalefactor - 1);
  console.log('x: ', x, ' y: ', y);
  if (candy[0] != x && candy[1] != y)
    for (player of snakes) {
      for (tailpiece of player.Tail) {
        if (tailpiece[0] == x && tailpiece[1] == y) {
          generatefruit();
          break;
        }
      }
    }
  candy = [y, x];
  // } else {
  //   generatecandy();
  // }
};

// ***********  generate snake objects ***********
const generateSnakes = function() {
  for (let i in roomInfo.players) {
    newsnake = new Snake(roomInfo.players[i].name, roomInfo.players[i].id, snakePositions[i], 'right', 1, snakeColors[i]);
    snakes.push(newsnake);
  }
  handlekeydowns();
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
  checkPlayer();

  gametick();
};

const checkPlayer = function() {
  console.log('checkplayer');
  //check if you are the host or not
  if (playerId == roomInfo.players[0]) {
    console.log('you are the host');
    playerNr = 0;
    // setTimeout(beginGame, 3);
    //admin maakt fruit en candy aan
    generatefruit();
    generatecandy();
  } else {
    //check wich player you are
    for (let nr in roomInfo.players) {
      if (playerId == roomInfo.players[nr].id) {
        playerNr = nr;
      }
      console.log('you are a player');
    }
  }
  generateSnakes();
};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  getdomelements();
  createfield();

  getSessionData();

  //generateSnakes();
  // beginGame;
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
