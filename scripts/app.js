let playerId;
let playerNr;
let roomInfo;

let stop = false;
let snakes = [];
let fruit = [null, null];
let candy = [null, null];
let canvas;
let ctx;
let gamewidth = 910;
let gameheight = 700;
let scalefactor = 35;
let framerate = 50;
let tijd;
let tijdHTML;
let lobbyButton;
let gameOverTekst;
let interval;

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
let snakeColors = ['#00FF00', '#FFFF00', '#0000FF', '#00FFFF'];

// ***********  DOM references ***********
const getdomelements = function() {
  canvas = document.querySelector('.js-gameboard');
  ctx = canvas.getContext('2d');
  tijdHTML = document.querySelector('.js-tijd');
  scoreHTML = document.querySelector('.js-score');
  lobbyButton = document.querySelector('.js-lobby');
  gameOverTekst = document.querySelector('.js-gameOver');
};

// ***********  HTML Generation ***********

// ***********  Callback ***********

// ***********  Data Access ***********

// ***********  Objects ***********

// ***********  Event Listeners ***********

const listener = function() {
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

// ***********  generate a black field ***********
const createfield = function() {
  ctx.clearRect(0, 0, gamewidth, gameheight);
};
// ***********  Move the snakes according to their speed ***********

const gameTick = function(snakeObj) {
  if (!stop) {
    let oldTail = [];
    for (let tailPiece of snakeObj.Tail) {
      let x = tailPiece[0] * scalefactor;
      let y = tailPiece[1] * scalefactor;
      let array = [x, y];
      oldTail.push(array);
    }
    //move the snake
    snakeObj.Movesnake();

    // console.log('available: ', availableFrames);
    let startTime = Date.now();
    let frame = 0;
    drawSnake(snakeObj, oldTail, frame, startTime);

    setTimeout(function() {
      gameTick(snakeObj);
    }, 100 * snakeObj.Speed);
  }
};

// ***********  display the snake ***********
const drawSnake = function(snake, oldTail, frame, startTime) {
  // console.log('draw snake, frame: ', frame);
  let availableFrames = (100 * snake.Speed) / (1000 / framerate);
  //amount of pixels are moved at once
  let pixelJump = scalefactor / availableFrames;
  //mss moeten waarden afgerond worden
  //make the snake disappear
  for (let tailPiece of oldTail) {
    ctx.clearRect(tailPiece[1] - 1, tailPiece[0] - 1, scalefactor + 2, scalefactor + 2);
    // ctx.clearRect(0, 0, gamewidth, gameheight);
  }
  //move the snaketail a few pixels
  // console.log('old tail: ', oldTail);
  for (let piece in oldTail) {
    if (oldTail.length > snake.Tail.length) {
      let removedTail = oldTail.splice(snake.Tail.length, oldTail.length - snake.Tail.length);
      for (let piece of removedTail) {
        ctx.clearRect(piece[1] - 1, piece[0] - 1, scalefactor + 2, scalefactor + 2);
      }
    }
    let destinationX = snake.Tail[piece][1] * scalefactor;
    let destinationY = snake.Tail[piece][0] * scalefactor;

    let oldX = oldTail[piece][1];
    let oldY = oldTail[piece][0];
    // console.log('from ', [oldX, oldY], 'to', [destinationX, destinationY]);
    // console.log('old offset: ', oldTail[piece]);
    let offsetX = 0;
    if (oldX < destinationX) {
      offsetX = pixelJump;
    } else if (destinationX < oldX) {
      offsetX = -pixelJump;
    }
    if (Math.abs(destinationX - oldX) != scalefactor && destinationX != oldX) {
      if (destinationX == 0) {
        // offscreen to the right
        offsetX = pixelJump;
      } else if (destinationX == gamewidth - scalefactor) {
        // offscreen to the left
        offsetX = -pixelJump;
      }
    }
    offsetX = offsetX * frame;

    let offsetY = 0;
    if (oldY < destinationY) {
      offsetY = pixelJump;
    } else if (destinationY < oldY) {
      offsetY = -pixelJump;
    }
    if (Math.abs(destinationY - oldY) != scalefactor && destinationY != oldY) {
      if (destinationY == 0) {
        // offscreen to the bottom
        offsetY = pixelJump;
      } else if (destinationY == gameheight - scalefactor) {
        // offscreen to the top
        offsetY = -pixelJump;
      }
    }
    offsetY = offsetY * frame;

    // console.log('drawing x: ', oldX + offsetX, 'y: ', oldY + offsetY);
    ctx.fillStyle = snake.Color;
    ctx.fillRect(oldX + offsetX, oldY + offsetY, scalefactor, scalefactor);
  }

  //tijd om de hele animatie uit te voeren
  let animationTime = 100 * snake.Speed;
  //tijd die je krijgt om een animatie frame te tekenen
  let timeBetweenFrames = animationTime / (1000 / framerate);
  //wanneer de huidige frame ten vroegste uitegevoerd mag worden
  // let timeWindowCurrentFrame = timeBetweenFrames * frame;
  //animate the movement
  let newFrame = frame + 1;
  if (newFrame <= availableFrames) {
    let excecuteTime = startTime + timeBetweenFrames * frame;
    let timeDiff = excecuteTime - Date.now();
    setTimeout(function() {
      drawSnake(snake, oldTail, newFrame, startTime);
    }, timeDiff);
  }
  return;
};
// ***********  refresh the display ***********

const displaysnakes = function() {
  createfield();
  for (let snake of snakes) {
    try {
      for (let piece of snake.Tail) {
        ctx.fillStyle = snake.Color;
        ctx.fillRect(piece[1] * scalefactor, piece[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
        if (piece == snake.Tail[0]) {
          ctx.fillStyle = '#006600';
          ctx.fillRect(piece[1] * scalefactor, piece[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
        }
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
  let x = Math.ceil(Math.random() * (gamewidth / scalefactor)) - 1;
  let y = Math.ceil(Math.random() * (gameheight / scalefactor)) - 1;
  fruit = [y, x];
  //make list of all locations taken by snakes and fruit

  let alltails = [];
  for (let player of snakes) {
    alltails = alltails.concat(player.Tail);
  }
  alltails.push(candy);
  // check if game is finished
  if (alltails.length == (gamewidth / scalefactor) * (gameheight / scalefactor)) {
    fruit = [-100, -100];
    stop = false;
    throw 'error';
    return;
  }
  // check if random location is a free spot

  for (let tail of alltails) {
    if (tail[0] == fruit[0] && tail[1] == fruit[1]) {
      generatefruit();
    }
  }
  // send the new location to players

  let fruitmessage = new Message('fruit', fruit);
  let message = new Paho.MQTT.Message(JSON.stringify(fruitmessage));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};

// ***********  generate candy ***********

const generatecandy = function() {
  //generate random location
  let x = Math.ceil((Math.random() * gamewidth) / scalefactor - 1);
  let y = Math.ceil((Math.random() * gameheight) / scalefactor - 1);
  candy = [y, x];
  //make list of all locations taken by snakes and fruit
  let alltails = [];
  for (let player of snakes) {
    alltails = alltails.concat(player.Tail);
  }
  alltails.push(fruit);
  // check if random location is a free spot
  for (let tail of alltails) {
    if (tail[0] == candy[0] && tail[1] == candy[1]) {
      generatecandy();
    }
  }
  // send the new location to players
  let candymessage = new Message('candy', candy);
  let message = new Paho.MQTT.Message(JSON.stringify(candymessage));
  message.destinationName = roomInfo.roomId;
  mqtt.send(message);
};

// ***********  generate snake objects ***********
const generateSnakes = function() {
  for (let i in roomInfo.players) {
    newsnake = new Snake(roomInfo.players[i].name, roomInfo.players[i].id, snakePositions[i], 'right', roomInfo.defaultSpeed, snakeColors[i]);
    snakes.push(newsnake);
  }
};
// ***********  Get Session Data ***********

const getSessionData = function() {
  playerId = sessionStorage.getItem('playerId');
  roomInfo = JSON.parse(sessionStorage.getItem('roomInfo'));
  checkPlayer();
  MQTTconnect();
};

const startCountDown = function() {
  tijd = roomInfo.gameDuration * 60 + 3;
  tijdHTML.innerHTML = tijd;
  console.log('tijd:', tijd);
  interval = setInterval(countDown, 1000);
  setTimeout(startMovement, 3000);
  setTimeout(gameOver, tijd * 1000);
};

const countDown = function() {
  tijd -= 1;
  tijdHTML.innerHTML = tijd;
};
const startMovement = function() {
  for (let snake of snakes) {
    gameTick(snake);
  }
};

const gameOver = function() {
  stop = true;
  clearInterval(interval);
  //gameOverTekst.innerHTML = 'Tijd is om, het spel is gedaan';
  if (playerNr == 0) {
    lobbyButton.style.display = 'block';
  }
  for (let snake of snakes) {
    console.log(snake.Name + ' score: ' + snake.score);
  }
};
// ***********  Begin Game ***********

const beginGame = function() {
  console.log('begin the game');
  checkPlayer();
  generateSnakes();
  handlekeydowns();
  if (playerNr == 0) {
    generatefruit();
    generatecandy();
  }
  // displaysnakes();
  startCountDown();
};
// ***********  UpdateScore ***********
const updatescore = function() {
  for (let snake of snakes) {
    console.log(snake.Name + ' score: ' + snake.score);
    scoreHTML.innerHTML(snake.score);
  }

  if (!stop) {
    setTimeout(function() {
      updatescore();
    }, 1000 / framerate);
  }
};

// ***********  CheckPlayer ***********

const checkPlayer = function() {
  //check if you are the host or not
  if (playerId == roomInfo.players[0].id) {
    playerNr = 0;
    for (player of roomInfo.players) {
      console.log('p:', player);
      loadedPlayers[player.id] = false;
    }
  } else {
    //check wich player you are
    for (let nr in roomInfo.players) {
      if (playerId == roomInfo.players[nr].id) {
        playerNr = nr;
      }
    }
  }
};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  listener();
  getdomelements();
  getSessionData();

  //generateSnakes();
  // beginGame;
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
