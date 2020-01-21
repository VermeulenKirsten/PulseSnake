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
let fruitImage, candyImage;
let countDownTime = 3;
let baseHeartBeat;
let baseSpeed = 4;
let tellerBaseHeartBeat = 0;

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

  fruitImage = document.querySelector('#js-fruitIcon');
  candyImage = document.querySelector('#js-candyIcon');
  buttonUpHTML = document.querySelector('.js-buttonUp');
  buttonLeftHTML = document.querySelector('.js-buttonLeft');
  buttonRightHTML = document.querySelector('.js-buttonRight');
  buttonDownHTML = document.querySelector('.js-buttonDown');
  clearTutorialHTML = document.querySelector('.js-clearTutorial');
};

// *********** HTML Generation ***********

// *********** Callback ***********

// *********** Data Access ***********

// *********** Objects ***********

// *********** Event Listeners ***********
const listener = function() {
  document.querySelector('.js-lobby').addEventListener('click', function() {
    if (playerNr != 0) {
      if (lobbyReady) {
        // message = new Paho.MQTT.Message(JSON.stringify(new Message('disconnect', playerId)));
        // message.destinationName = roomInfo.roomId;
        // mqtt.send(message);
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
  for (let tailPiece of oldTail) {
    ctx.clearRect(tailPiece[1] - 1, tailPiece[0] - 1, scalefactor + 2, scalefactor + 2);
  }
  //move the snaketail a few pixels
  ctx.fillStyle = snake.Color;
  for (let piece in oldTail) {
    if (oldTail.length > snake.Tail.length) {
      let removedTail = oldTail.splice(snake.Tail.length, oldTail.length - snake.Tail.length);
      for (let piece of removedTail) {
        // ctx.clearRect(piece[1] - 1, piece[0] - 1, scalefactor + 2, scalefactor + 2);
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
        ctx.fillRect(0 - scalefactor + offsetX * frame, oldY, scalefactor, scalefactor);
      } else if (destinationX == gamewidth - scalefactor) {
        // offscreen to the left
        offsetX = -pixelJump;
        ctx.fillRect(gamewidth + offsetX * frame, oldY, scalefactor, scalefactor);
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
        ctx.fillRect(oldX, 0 - scalefactor + offsetY * frame, scalefactor, scalefactor);
      } else if (destinationY == gameheight - scalefactor) {
        // offscreen to the top
        offsetY = -pixelJump;
        ctx.fillRect(oldX, gameheight + offsetY * frame, scalefactor, scalefactor);
      }
    }
    offsetY = offsetY * frame;
    ctx.fillRect(oldX + offsetX, oldY + offsetY, scalefactor, scalefactor);
  }
};
// *********** refresh the display ***********
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

// *********** function to draw rotated images ***********
const drawImage = function(image, x, y, degrees) {
  ctx.save();
  ctx.translate(x + scalefactor / 2, y + scalefactor / 2);
  ctx.rotate((degrees * Math.PI) / 180.0);
  ctx.translate(-x - scalefactor / 2, -y - scalefactor / 2);
  ctx.drawImage(image, x, y, scalefactor, scalefactor);
  ctx.restore();
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
    newsnake = new Snake(roomInfo.players[i].name, roomInfo.players[i].id, snakePositions[i], 'right', roomInfo.defaultSpeed, snakeColors[i]);
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
  MQTTconnect();
};

const startCountDown = function() {
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

const gameOver = function() {
  stop = true;
  clearInterval(interval);
  countDownhtml.style.display = 'flex';
  countDownhtml.children[0].innerHTML = 'STOP!';
};
// *********** Begin Game ***********

const beginGame = function() {
  console.log('begin the game');
  checkPlayer();
  generateSnakes();
  handlekeydowns();
  tutorialbuttons();
  getHeartbeat(scores);
  initializeScores();
  updatescore();
  if (playerNr == 0) {
    generatefruit();
    generatecandy();
  }
  // displaysnakes();
  startCountDown();
};

const tutorialbuttons = function() {
  document.addEventListener('keydown', function(key) {
    if (key.which === 37) {
      buttonLeftHTML.classList.add('c-tutorial__button-ok');
    }
    //up arrow key pressed
    else if (key.which === 38) {
      buttonUpHTML.classList.add('c-tutorial__button-ok');
    }
    //right arrow key pressed
    else if (key.which === 39) {
      buttonRightHTML.classList.add('c-tutorial__button-ok');
    }
    //down arrow key pressed
    else if (key.which === 40) {
      buttonDownHTML.classList.add('c-tutorial__button-ok');
    }
  });

  clearTutorialHTML.addEventListener('click', function() {
    buttonLeftHTML.classList.remove('c-tutorial__button-ok');
    buttonDownHTML.classList.remove('c-tutorial__button-ok');
    buttonRightHTML.classList.remove('c-tutorial__button-ok');
    buttonUpHTML.classList.remove('c-tutorial__button-ok');
  });
};

const getHeartbeatCurrentSnake = function(heartValue) {
  snakes[playerNr].heartbeat = heartValue;
  let snakespeed = (heartValue - baseHeartBeat) / 100;
  console.log('heartvalue: ' + heartValue);
  console.log('-');
  console.log('baseheartbeat: ' + baseHeartBeat);
  console.log('snakespeed: ' + snakespeed);
  console.log('basespeed: ' + baseSpeed);
  snakes[playerNr].Speed = baseSpeed - snakespeed;
  console.log('current speed: ' + snakes[playerNr].Speed);
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
        //log('Argh! ' + error);
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
        console.log(hartslagwaardeHTML);
        hartslagwaardeHTML.innerHTML = heartValue;
        pompendHartHTML.classList.add('c-tutorial__heart-connected');
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

// *********** Init / DOMContentLoaded ***********
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
