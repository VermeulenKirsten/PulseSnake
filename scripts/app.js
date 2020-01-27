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
let gameheight = 770;
let scalefactor = 35;
let framerate = 50;
let tijd;
let tijdHTML;
let lobbyButton;
let gameOverTekst;
let interval;
let readyHTML;
let lobbyReady;
let scores;
let device;
let countDownhtml;
let fruitImage, candyImage, snakeHead, snakeBody, snakeCorner, snakeTail;
let audioPlayer, fruitSound, candySound, hitSound, muteButton;
let countDownTime = 3;
let baseHeartBeat;
let baseSpeed = 4;
let tellerBaseHeartBeat = 0;
let heartLoadingAnimation;
let makeymakeytest = 0;

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
let snakeColors = ['#00FF00', '#0000FF', '#00FFFF', '#FFFF00'];

// *********** DOM references ***********
const getdomelements = function() {
  canvas = document.querySelector('.js-gameboard');
  ctx = canvas.getContext('2d');
  tijdHTML = document.querySelector('.js-tijd');
  scoreHTML = document.querySelector('.js-score');
  lobbyButton = document.querySelector('.js-lobby');
  gameOverTekst = document.querySelector('.js-gameOver');
  readyHTML = document.querySelector('.js-lobbyReady');
  countDownhtml = document.querySelector('.js-countDown');
  hartslagwaardeHTML = document.querySelector('.js-hartslagwaarde');
  pompendHartHTML = document.querySelector('.js-pompendHart');
  continueHeartHTML = document.querySelector('.js-continue-heart');
  overlayHTML = document.querySelector('.js-overlay-heart');
  continueMovementHTML = document.querySelector('.js-continue-buttons');
  overlayMovementHTML = document.querySelector('.js-overlay-buttons');
  fruitImage = document.querySelector('#js-fruitIcon');
  candyImage = document.querySelector('#js-candyIcon');
  buttonUpHTML = document.querySelector('.js-buttonUp');
  buttonLeftHTML = document.querySelector('.js-buttonLeft');
  buttonRightHTML = document.querySelector('.js-buttonRight');
  buttonDownHTML = document.querySelector('.js-buttonDown');
  clearTutorialHTML = document.querySelector('.js-clearTutorial');
  infoHartslagHTML = document.querySelector('.js-infoHartslag');
  infoBesturingHTML = document.querySelector('.js-infoBesturing');
  modalHTML = document.querySelector('.js-modal-hart');
  modalBesturingHTML = document.querySelector('.js-modal-besturing');
  spanHartslag = document.getElementsByClassName('c-close')[0];
  spanBesturing = document.getElementsByClassName('c-close-besturing')[0];

  greenSnakeHead = document.querySelector('#js-greensnakehead');
  greenSnakeTail = document.querySelector('#js-greensnaketail');
  greenSnakeBody = document.querySelector('#js-greensnakebody');
  greenSnakeCorner = document.querySelector('#js-greensnakecorner');
  redSnakeHead = document.querySelector('#js-redsnakehead');
  redSnakeTail = document.querySelector('#js-redsnaketail');
  redSnakeBody = document.querySelector('#js-redsnakebody');
  redSnakeCorner = document.querySelector('#js-redsnakecorner');
  blueSnakeHead = document.querySelector('#js-bluesnakehead');
  blueSnakeTail = document.querySelector('#js-bluesnaketail');
  blueSnakeBody = document.querySelector('#js-bluesnakebody');
  blueSnakeCorner = document.querySelector('#js-bluesnakecorner');
  yellowSnakeHead = document.querySelector('#js-yellowsnakehead');
  yellowSnakeTail = document.querySelector('#js-yellowsnaketail');
  yellowSnakeBody = document.querySelector('#js-yellowsnakebody');
  yellowSnakeCorner = document.querySelector('#js-yellowsnakecorner');

  audioPlayer = document.querySelector('#js-audioplayer');
  fruitSound = document.querySelector('#js-fruitsound');
  candySound = document.querySelector('#js-candysound');
  hitSound = document.querySelector('#js-hitsound');
  heartLoadingAnimation = document.querySelector('.js-heartanimation');
};

// *********** Event Listeners ***********
const listener = function() {
  document.querySelector('.js-lobby').addEventListener('click', function() {
    if (playerNr != 0) {
      if (lobbyReady) {
        for (let player of roomInfo.players) {
          if (player.id == playerId) {
            sessionStorage.setItem('player', JSON.stringify(player));
          }
        }
        window.location.href = 'hostlobby.html?roomId=' + roomInfo.roomId;
      } else {
        message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
        message.destinationName = roomInfo.roomId;
        mqtt.send(message);
        window.location.href = 'index.html';
      }
    } else {
      for (let player in roomInfo.players) {
        roomInfo.players[player].ready = false;
      }
      console.log(roomInfo);
      sessionStorage.setItem('roomInfo', JSON.stringify(roomInfo));
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

// *********** generate a black field ***********
const createfield = function() {
  ctx.clearRect(0, 0, gamewidth, gameheight);
};
// *********** Move the snakes according to their speed ***********
const gameTick = function(snakeObj) {
  if (!stop && snakes.includes(snakeObj)) {
    let oldTail = [];
    for (let tailPiece of snakeObj.Tail) {
      let x = tailPiece[0] * scalefactor;
      let y = tailPiece[1] * scalefactor;
      let array = [x, y];
      oldTail.push(array);
    }
    //move the snake
    snakeObj.Movesnake();

    let animationTime = 100 * snakeObj.Speed;
    let timeBetweenFrames = animationTime / scalefactor;

    for (let frame = 0; frame < scalefactor; frame++) {
      setTimeout(function() {
        // requestAnimationFrame(function() {
        drawSnake(snakeObj, oldTail, frame);
        // });
      }, timeBetweenFrames * frame);
    }

    setTimeout(function() {
      gameTick(snakeObj);
    }, 100 * snakeObj.Speed);
  }
};

// *********** display the snake ***********
const drawSnake = function(snake, oldTail, frame) {
  let pixelJump = 1;
  //clear old tail
  for (let tailPiece of oldTail) {
    ctx.clearRect(tailPiece[1], tailPiece[0], scalefactor, scalefactor);
  }
  //scanning for places where cornerpieces are needed
  // let cornerPieces = [];
  // for (let piece in snake.Tail) {
  //   piece = parseInt(piece);
  //   if (piece != 0 && piece != snake.Tail.length - 1) {
  //     if (snake.Tail[piece - 1][0] == snake.Tail[piece][0] && snake.Tail[piece][1] == snake.Tail[piece + 1][1]) {
  //       cornerPieces.push([snake.Tail[piece][0] * scalefactor, snake.Tail[piece][1] * scalefactor]);
  //     } else if (snake.Tail[piece - 1][1] == snake.Tail[piece][1] && snake.Tail[piece][0] == snake.Tail[piece + 1][0]) {
  //       cornerPieces.push([snake.Tail[piece][0] * scalefactor, snake.Tail[piece][1] * scalefactor]);
  //     }
  //   }
  // }
  // if (cornerPieces.length != 0) {
  //   console.log(snake.Tail);
  //   console.log(cornerPieces);
  // }

  //move the snaketail a few pixels
  ctx.fillStyle = snake.Color;
  for (let piece in oldTail) {
    piece = parseInt(piece);
    //the image this piece needs
    let image = snake.body;
    let angle = 0;
    //check if the piece is a head
    if (piece == 0) {
      image = snake.head;
      //check what angle it should have
      if (snake.Inputbuffer[0] == 'right') {
        angle = 0;
      } else if (snake.Inputbuffer[0] == 'down') {
        angle = 90;
      } else if (snake.Inputbuffer[0] == 'left') {
        angle = 180;
      } else if (snake.Inputbuffer[0] == 'up') {
        angle = 270;
      }
    }
    //check if the piece is a tail
    else if (piece == oldTail.length - 1) {
      image = snake.tail;
      if (oldTail[piece - 1][0] == oldTail[piece][0]) {
        if (oldTail[piece - 1][1] > oldTail[piece][1]) {
          angle = 0;
        } else {
          angle = 180;
        }
      } else {
        if (oldTail[piece - 1][0] > oldTail[piece][0]) {
          angle = 90;
        } else {
          angle = 270;
        }
      }
    }
    //body controle
    else {
      if (snake.Tail[piece][1] * scalefactor == oldTail[piece][1]) {
        if (oldTail[piece - 1][0] > oldTail[piece][0]) {
          angle = 90;
        } else {
          angle = 270;
        }
      } else if (snake.Tail[piece][0] * scalefactor == oldTail[piece][0]) {
        if (oldTail[piece - 1][1] > oldTail[piece][1]) {
          angle = 0;
        } else {
          angle = 180;
        }
      }
    }
    //delete old pieces if snake has shrunk
    if (oldTail.length > snake.Tail.length) {
      let removedTail = oldTail.splice(snake.Tail.length, oldTail.length - snake.Tail.length);
      for (let piece of removedTail) {
        ctx.clearRect(piece[1], piece[0], scalefactor, scalefactor);
      }
    }
    let destinationX = snake.Tail[piece][1] * scalefactor;
    let destinationY = snake.Tail[piece][0] * scalefactor;

    let oldX = oldTail[piece][1];
    let oldY = oldTail[piece][0];

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
        // ctx.fillRect(0 - scalefactor + offsetX * frame, oldY, scalefactor, scalefactor);
        angle = 0;
        drawImage(image, 0 - scalefactor + offsetX * frame, oldY, angle);
      } else if (destinationX == gamewidth - scalefactor) {
        // offscreen to the left
        offsetX = -pixelJump;
        // ctx.fillRect(gamewidth + offsetX * frame, oldY, scalefactor, scalefactor);
        angle = 180;
        drawImage(image, gamewidth + offsetX * frame, oldY, angle);
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
        angle = 90;
        drawImage(image, oldX, 0 - scalefactor + offsetY * frame, angle);
      } else if (destinationY == gameheight - scalefactor) {
        // offscreen to the top
        offsetY = -pixelJump;
        angle = 270;
        drawImage(image, oldX, gameheight + offsetY * frame, angle);
      }
    }
    offsetY = offsetY * frame;
    drawImage(image, oldX + offsetX, oldY + offsetY, angle);
  }
  //draw the corners
  for (let piece in snake.Tail) {
    piece = parseInt(piece);
    if (piece != 0 && piece != snake.Tail.length - 1) {
      //verticaal na horizontaal draaien
      if (snake.Tail[piece - 1][0] == snake.Tail[piece][0] && snake.Tail[piece][1] == snake.Tail[piece + 1][1]) {
        if (snake.Tail[piece - 1][1] > snake.Tail[piece][1] && snake.Tail[piece][0] < snake.Tail[piece + 1][0]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 270);
        } else if (snake.Tail[piece - 1][1] > snake.Tail[piece][1] && snake.Tail[piece][0] > snake.Tail[piece + 1][0]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 180);
        } else if (snake.Tail[piece - 1][1] < snake.Tail[piece][1] && snake.Tail[piece][0] > snake.Tail[piece + 1][0]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 90);
        } else if (snake.Tail[piece - 1][1] < snake.Tail[piece][1] && snake.Tail[piece][0] < snake.Tail[piece + 1][0]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 0);
        }
        ctx.clearRect(piece[1], piece[0], scalefactor, scalefactor);
      } else if (snake.Tail[piece - 1][1] == snake.Tail[piece][1] && snake.Tail[piece][0] == snake.Tail[piece + 1][0]) {
        if (snake.Tail[piece - 1][0] > snake.Tail[piece][0] && snake.Tail[piece][1] < snake.Tail[piece + 1][1]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 270);
        } else if (snake.Tail[piece - 1][0] > snake.Tail[piece][0] && snake.Tail[piece][1] > snake.Tail[piece + 1][1]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 0);
        } else if (snake.Tail[piece - 1][0] < snake.Tail[piece][0] && snake.Tail[piece][1] > snake.Tail[piece + 1][1]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 90);
        } else if (snake.Tail[piece - 1][0] < snake.Tail[piece][0] && snake.Tail[piece][1] < snake.Tail[piece + 1][1]) {
          drawImage(snake.corner, snake.Tail[piece][1] * scalefactor, snake.Tail[piece][0] * scalefactor, 180);
        }
        ctx.clearRect(piece[1], piece[0], scalefactor, scalefactor);
      }
    }
  }
};

// *********** function to draw rotated images ***********
const drawImage = function(image, x, y, degrees) {
  if (image != null) {
    ctx.save();
    ctx.translate(x + scalefactor / 2, y + scalefactor / 2);
    ctx.rotate((degrees * Math.PI) / 180.0);
    ctx.translate(-x - scalefactor / 2, -y - scalefactor / 2);
    ctx.drawImage(image, x, y, scalefactor, scalefactor);
    ctx.restore();
  }
};

// *********** generate fruit ***********
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
    gameOver();
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

// *********** draw fruit ***********
const drawFruit = function() {
  drawImage(fruitImage, fruit[1] * scalefactor, fruit[0] * scalefactor, 0);
};

// *********** generate candy ***********
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

// *********** draw candy ***********
const drawCandy = function() {
  drawImage(candyImage, candy[1] * scalefactor, candy[0] * scalefactor, 0);
};

// *********** generate snake objects ***********
const generateSnakes = function() {
  for (let i in roomInfo.players) {
    newsnake = new Snake(roomInfo.players[i].name, roomInfo.players[i].id, snakePositions[i], 'right', roomInfo.defaultSpeed, roomInfo.players[i].color);
    switch (roomInfo.players[i].color) {
      case '#FF0000':
        newsnake.head = redSnakeHead;
        newsnake.body = redSnakeBody;
        newsnake.corner = redSnakeCorner;
        newsnake.tail = redSnakeTail;
        break;
      case '#00FF00':
        newsnake.head = greenSnakeHead;
        newsnake.body = greenSnakeBody;
        newsnake.corner = greenSnakeCorner;
        newsnake.tail = greenSnakeTail;
        break;
      case '#0000FF':
        newsnake.head = blueSnakeHead;
        newsnake.body = blueSnakeBody;
        newsnake.corner = blueSnakeCorner;
        newsnake.tail = blueSnakeTail;
        break;
      case '#FFFF00':
        newsnake.head = yellowSnakeHead;
        newsnake.body = yellowSnakeBody;
        newsnake.corner = yellowSnakeCorner;
        newsnake.tail = yellowSnakeTail;
        break;
    }
    snakes.push(newsnake);
  }
};
// *********** Get Session Data ***********

const getSessionData = function() {
  playerId = sessionStorage.getItem('playerId');
  oldRoom = JSON.parse(sessionStorage.getItem('roomInfo'));
  roomInfo = new room(oldRoom.roomId);
  roomInfo.players = oldRoom.players;
  roomInfo.defaultSpeed = oldRoom.defaultSpeed;
  roomInfo.gameDuration = oldRoom.gameDuration;
  checkPlayer();
  // MQTTconnect();
};

const startCountDown = function() {
  audioPlayer.play();
  muteButton = document.querySelector('#js-mute');
  muteButton.addEventListener('click', function() {
    console.log(muteButton);
    audioPlayer.muted = !muteButton.checked;
  });
  if (countDownTime == 0) {
    countDownhtml.children[0].innerHTML = 'GO!';
  } else if (countDownTime == -1) {
    countDownhtml.style.display = 'none';
  } else {
    countDownhtml.children[0].innerHTML = countDownTime;
  }
  countDownTime -= 1;
  if (countDownTime >= -1) {
    setTimeout(startCountDown, 1000);
    if (countDownTime == 0) {
      setTimeout(startGame, 1000);
    }
  }
};
const startGame = function() {
  startMovement();
  tijd = roomInfo.gameDuration * 60;
  tijdHTML.innerHTML = tijd;
  interval = setInterval(countDown, 1000);
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

const playMusic = function() {
  audioPlayer.play();
  audioPlayer.loop = true;
  muteButton = document.querySelector('#js-mute');
  muteButton.addEventListener('click', function() {
    console.log(muteButton);
    audioPlayer.muted = !muteButton.checked;
  });
};
const gameOver = function() {
  stop = true;
  clearInterval(interval);
  countDownhtml.style.display = 'flex';
  countDownhtml.children[0].innerHTML = 'STOP!';
  if (playerNr == 0) {
    let eindscores = [];
    for (let snake of snakes) {
      eindscores.push({ Name: snake.Name, Score: snake.score, ScoreType: 'score', Minuten: roomInfo.gameDuration });
      eindscores.push({ Name: snake.Name, Score: snake.Speed, ScoreType: 'snelheid', Minuten: roomInfo.gameDuration });
      eindscores.push({ Name: snake.Name, Score: snake.topLength, ScoreType: 'lengte', Minuten: roomInfo.gameDuration });
      eindscores.push({ Name: snake.Name, Score: snake.fruitEaten, ScoreType: 'fruit', Minuten: roomInfo.gameDuration });
      eindscores.push({ Name: snake.Name, Score: snake.candyEaten, ScoreType: 'candy', Minuten: roomInfo.gameDuration });
      eindscores.push({ Name: snake.Name, Score: snake.topHeartbeat, ScoreType: 'hartslag', Minuten: roomInfo.gameDuration });
    }
    for (let eindscore of eindscores) {
      fetch('https://kotsapi.azurewebsites.net/api/newScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // this line is important, if this content-type is not set it wont work
        body: JSON.stringify(eindscore) //use the stringify object of the queryString class
      });
    }
  }
};
// *********** Begin Game ***********

const beginGame = function() {
  console.log('begin the game');
  checkPlayer();
  handlekeydowns();
  initializeScores();
  updatescore();
  if (playerNr == 0) {
    generatefruit();
    generatecandy();
  }
  // displaysnakes();
  startCountDown();
};

const infobuttons = function() {
  window.addEventListener('click', function(event) {
    if (event.target == modalHTML || event.target == modalBesturingHTML) {
      modalBesturingHTML.style.display = 'none';
      modalHTML.style.display = 'none';
    }
  });

  infoHartslagHTML.addEventListener('click', function() {
    modalHTML.style.display = 'block';
  });

  infoBesturingHTML.addEventListener('click', function() {
    modalBesturingHTML.style.display = 'block';
  });

  spanHartslag.addEventListener('click', function() {
    modalHTML.style.display = 'none';
  });

  spanBesturing.addEventListener('click', function() {
    modalBesturingHTML.style.display = 'none';
  });
};

const continueTutorial = function() {
  continueHeartHTML.addEventListener('click', function() {
    overlayHTML.classList.add('o-hide-accessible');
    overlayMovementHTML.classList.remove('o-hide-accessible');
  });
  continueMovementHTML.addEventListener('click', function() {
    overlayHTML.classList.add('o-hide-accessible');
    overlayMovementHTML.classList.add('o-hide-accessible');
    playMusic();
    InitiateStartSecuence();
  });
};

const tutorialbuttons = function() {
  document.addEventListener('keydown', function(key) {
    if (key.which === 37) {
      buttonLeftHTML.classList.add('c-tutorial__button-ok');
      showContinue();
    }
    //up arrow key pressed
    else if (key.which === 38) {
      buttonUpHTML.classList.add('c-tutorial__button-ok');
      showContinue();
    }
    //right arrow key pressed
    else if (key.which === 39) {
      buttonRightHTML.classList.add('c-tutorial__button-ok');
      showContinue();
    }
    //down arrow key pressed
    else if (key.which === 40) {
      buttonDownHTML.classList.add('c-tutorial__button-ok');
      showContinue();
    }
  });

  clearTutorialHTML.addEventListener('click', function() {
    buttonLeftHTML.classList.remove('c-tutorial__button-ok');
    buttonDownHTML.classList.remove('c-tutorial__button-ok');
    buttonRightHTML.classList.remove('c-tutorial__button-ok');
    buttonUpHTML.classList.remove('c-tutorial__button-ok');
    continueMovementHTML.classList.add('o-hide-accessible');
  });
};

const showContinue = function() {
  if (
    buttonLeftHTML.classList.contains('c-tutorial__button-ok') &&
    buttonRightHTML.classList.contains('c-tutorial__button-ok') &&
    buttonUpHTML.classList.contains('c-tutorial__button-ok') &&
    buttonDownHTML.classList.contains('c-tutorial__button-ok')
  ) {
    console.log('nice');
    continueMovementHTML.classList.remove('o-hide-accessible');
  }
};

const getHeartbeatCurrentSnake = function(heartValue) {
  snakes[playerNr].heartbeat = heartValue;
  let snakespeed = (heartValue - baseHeartBeat) / 100;
  snakes[playerNr].Speed = baseSpeed - snakespeed;
};

const getHeartbeat = function() {
  const searchParams = new URL(location).searchParams;

  var myCharacteristic;

  function onStartButtonClick() {
    let serviceUuid = 'heart_rate';
    if (serviceUuid.startsWith('0x')) {
      serviceUuid = parseInt(serviceUuid);
    }

    let characteristicUuid = 'heart_rate_measurement';
    if (characteristicUuid.startsWith('0x')) {
      characteristicUuid = parseInt(characteristicUuid);
    }
    heartLoadingAnimation.style.display = 'block';

    //log('Requesting Bluetooth Device...');
    navigator.bluetooth
      .requestDevice({ filters: [{ services: [serviceUuid] }] })
      .then(device => {
        //log('Connecting to GATT Server...');
        return device.gatt.connect();
        // reconnect();
      })
      .then(server => {
        //log('Getting Service...');
        return server.getPrimaryService(serviceUuid);
      })
      .then(service => {
        //log('Getting Characteristic...');
        return service.getCharacteristic(characteristicUuid);
      })
      .then(characteristic => {
        myCharacteristic = characteristic;
        return myCharacteristic.startNotifications().then(_ => {
          // log('> Notifications started');
          myCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        });
      })
      .catch(error => {
        // log('Argh! ' + error);
        heartLoadingAnimation.style.display = 'none';
      });
  }

  function reconnect() {
    exponentialBackoff(
      3 /* max retries */,
      2 /* seconds delay */,
      function toTry() {
        time('Connecting to Bluetooth Device... ');
        return device.gatt.connect();
      },
      function success() {
        log('> Bluetooth Device connected. Try disconnect it now.');
      },
      function fail() {
        time('Failed to reconnect.');
      }
    );
  }
  function onStopButtonClick() {
    if (myCharacteristic) {
      myCharacteristic
        .stopNotifications()
        .then(_ => {
          //log('> Notifications stopped');
          myCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
        })
        .catch(error => {
          //log('Argh! ' + error);
        });
    }
  }

  function handleNotifications(event) {
    let value = event.target.value;
    let a = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    let heartValue;
    for (let i = 0; i < value.byteLength; i++) {
      heartValue = value
        .getUint8(i)
        .toString(16)
        .slice(-2);
      heartValue = parseInt(heartValue, 16);
      a.push(heartValue);

      if ((heartValue > 0) & (typeof heartValue == 'number')) {
        if (tellerBaseHeartBeat < 1) {
          baseHeartBeat = heartValue;
          console.log('BaseHeartBeat: ' + baseHeartBeat);
          tellerBaseHeartBeat = 1;
        }
        getHeartbeatCurrentSnake(heartValue);
        hartslagwaardeHTML.innerHTML = heartValue;
        pompendHartHTML.classList.add('c-tutorial__heart-connected');
        heartLoadingAnimation.style.display = 'none';
      }
    }
  }
  document.querySelector('.js-hartslag').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
      //ChromeSamples.clearLog();
      onStartButtonClick();
    }
  });
  function isWebBluetoothEnabled() {
    if (navigator.bluetooth) {
      return true;
    } else {
      ChromeSamples.setStatus('Web Bluetooth API is not available.\n' + 'Please make sure the "Experimental Web Platform features" flag is enabled.');
      return false;
    }
  }
  /* jshint ignore: */
  (function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    (i[r] =
      i[r] ||
      function() {
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
  ga('create', 'UA-53563471-1', 'auto');
  ga('send', 'pageview');

  function time(text) {
    log('[' + new Date().toJSON().substr(11, 8) + '] ' + text);
  }
};

const initializeScores = function() {
  scoreHTML.innerHTML = '';
  for (let snake in snakes) {
    snake = parseInt(snake) + 1;
    scoreHTML.innerHTML += `<div class="c-player">
        <!-- Standing -->
        <p class="u-row-2 u-mb-clear c-lead-xxl" ">${snake}</p>
        <!-- Player -->
        <p class="u-mb-clear ${'js-score-name-' + snake}">s</p>
        <!-- Number of points -->
        <p class="u-mb-clear ${'js-score-score-' + snake}"></p>
        <!-- Heartbeat -->
        <div class="o-layout__center">
          <svg aria-hidden="true" focusable="false" class="c-icon c-icon__heart c-icon__gap" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" ><path fill="#FFFFFF" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>
          <p class="u-mb-clear ${'js-score-heartBeat-' + snake}">80</p>
        </div>
        <!-- The word Punten -->
        <p class="u-mb-clear">Punten</p>
      </div>
    `;
  }
};

// *********** UpdateScore ***********
const updatescore = function() {
  scores = [];
  for (let snake of snakes) {
    scores.push(snake);
  }
  scores.sort((a, b) => a.score - b.score).reverse();

  for (let snake in scores) {
    scoreHTML.children[snake].children[1].innerHTML = scores[snake].Name;
    scoreHTML.children[snake].children[2].innerHTML = scores[snake].score;
    scoreHTML.children[snake].children[3].children[1].innerHTML = scores[snake].heartbeat;
    scoreHTML.children[snake].children[3].children[0].children[0].setAttribute('fill', scores[snake].Color);
  }

  if (!stop) {
    setTimeout(function() {
      updatescore();
    }, 1000 / framerate);
  }
};

// *********** CheckPlayer ***********

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

const InitiateStartSecuence = function() {
  listener();
  MQTTconnect();
};

// *********** Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  // listener();
  getdomelements();
  getSessionData();
  continueTutorial();
  infobuttons();
  tutorialbuttons();
  getHeartbeat(scores);
  generateSnakes();

  //generateSnakes();
  // beginGame;
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
