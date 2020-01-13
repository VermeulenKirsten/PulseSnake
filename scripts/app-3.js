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
let framerate = 100;

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
  document.addEventListener('keydown', function(key) {
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
      snakes[playerNr].Input('slow');
    } else if (key.which === 70) {
      stop = true;
      console.log(stop);
    }
  });
};

// ***********  Core Game Mechanics ***********
const createfield = function() {
  ctx.clearRect(0, 0, gamewidth, gameheight);
};

const gameTick = function(snakeobj) {
  if (!stop) {
    snakeobj.Movesnake();
    setTimeout(function() {
      gameTick(snakeobj);
    }, 100 * snakeobj.Speed);
  }
};

const displaysnakes = function() {
  createfield();
  for (let snake of snakes) {
    try {
      for (let piece of snake.Tail) {
        ctx.fillStyle = snake.Color;
        ctx.fillRect(piece[1] * scalefactor, piece[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
      }
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(fruit[1] * scalefactor, fruit[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
      // show the candy
      ctx.fillStyle = '#FF00FF';
      ctx.fillRect(candy[1] * scalefactor, candy[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
    } catch {
      snake.isalive = false;
      console.log('u dead boi');
      stop = true;
    }
  }
  if (!stop) {
    setTimeout(function() {
      displaysnakes();
    }, 1000 / framerate);
  }
};

// ***********  generate fruit ***********
const generatefruit = function() {
  // console.log('generating fruit');
  x = Math.ceil((Math.random() * gamewidth) / scalefactor - 1);
  y = Math.ceil((Math.random() * gameheight) / scalefactor - 1);
  // console.log('x: ', x, ' y: ', y);
  if (candy[0] != y && candy[1] != x)
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
  // console.log('ge  nerating candy');
  x = Math.ceil((Math.random() * gamewidth) / scalefactor - 1);
  y = Math.ceil((Math.random() * gameheight) / scalefactor - 1);
  // console.log('x: ', x, ' y: ', y);
  if (fruit[0] != y && fruit[1] != x)
    for (player of snakes) {
      for (tailpiece of player.Tail) {
        if (tailpiece[0] == x && tailpiece[1] == y) {
          generatecandy();
          break;
        }
      }
    }
  candy = [y, x];
  let candymessage = new Message('candy', candy);
  let message = new Paho.MQTT.Message(JSON.stringify(candymessage));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};

// ***********  generate snake objects ***********
const generateSnakes = function() {
  for (let i in roomInfo.players) {
    newsnake = new Snake(roomInfo.players[i].name, roomInfo.players[i].id, snakePositions[i], 'right', 5.4, snakeColors[i]);
    snakes.push(newsnake);
  }
};

const getSessionData = function() {
  playerId = sessionStorage.getItem('playerId');
  console.log(playerId);
  roomInfo = JSON.parse(sessionStorage.getItem('roomInfo'));
  console.log(roomInfo);

  let startTime = sessionStorage.getItem('startTime');
  console.log(playerId);
  console.log(roomInfo);
  checkPlayer();
  MQTTconnect();
};

const beginGame = function() {
  console.log('begin the game');
  checkPlayer();
  generateSnakes();
  handlekeydowns();
  if (playerNr == 0) {
    generatefruit();
    generatecandy();
  }
  for (let snake of snakes) {
    gameTick(snake);
  }
  displaysnakes();
};

const checkPlayer = function() {
  console.log('checkplayer');
  //check if you are the host or not
  if (playerId == roomInfo.players[0].id) {
    console.log('you are the host');
    playerNr = 0;
    for (player in roomInfo.players) {
      loadedPlayers[playerId] = false;
    }
    console.log(loadedPlayers);
    // setTimeout(beginGame, 3);
    //admin maakt fruit en candy aan
  } else {
    //check wich player you are
    for (let nr in roomInfo.players) {
      if (playerId == roomInfo.players[nr].id) {
        playerNr = nr;
      }
      console.log('you are a player');
    }
  }
};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  getdomelements();
  getSessionData();

  //generateSnakes();
  // beginGame;
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
