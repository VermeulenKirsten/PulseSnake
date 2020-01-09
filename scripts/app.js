// let inputbuffer = ['right'];
let gamefield = [[]];
let stop = false;
let snakes = [];
let fruit = [null, null];
let candy = [null, null];
let canvas;
let ctx;
let gamewidth = 533;
let gameheight = 533;
let scalefactor = 20;
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
    //left arrow key pressed
    if (key.which === 37) {
      snake1.Input('left');
    }
    //up arrow key pressed
    else if (key.which === 38) {
      snake1.Input('up');
    }
    //right arrow key pressed
    else if (key.which === 39) {
      snake1.Input('right');
    }
    //down arrow key pressed
    else if (key.which === 40) {
      snake1.Input('down');
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
  // console.log('create field');
  // gamefield = [];
  // for (let x = 0; x < gamewidth; x++) {
  //   gamefield.push([]);
  //   for (let y = 0; y < gameheight; y++) {
  //     gamefield[x].push(0);
  //   }
  // }
  ctx.clearRect(0, 0, gamewidth, gameheight);
};

const displaysnake = function(snakeobj) {
  // console.log('snakeopbject: ', snakeobj);
  try {
    for (let piece of snakeobj.Tail) {
      // gamefield[piece[0]][piece[1]] = 1;
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
  // gamefield[fruit[0]][fruit[1]] = 2;
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(fruit[1] * scalefactor, fruit[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);
  // show the candy
  // gamefield[candy[0]][candy[1]] = 3;
  ctx.fillStyle = '#FF00FF';
  ctx.fillRect(candy[1] * scalefactor, candy[0] * scalefactor, 1 * scalefactor, 1 * scalefactor);

  // move the snake
  for (player of snakes) {
    player.Movesnake();
  }

  //display the snake
  for (player of snakes) {
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
    for (player of snakes) {
      for (tailpiece of player.Tail) {
        if (tailpiece[0] == x && tailpiece[1] == y) {
          generatefruit();
          break;
        }
      }
    }
  fruit = [y, x];
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

// ***********  generate candy ***********
const Generatesnakes = function() {};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  Generatesnakes();

  MQTTconnect();

  let xpos = 5;
  let ypos = 5;
  let tail = [
    [xpos, ypos],
    [xpos - 1, ypos],
    [xpos - 2, ypos],
    [xpos - 3, ypos],
    [xpos - 4, ypos]
  ];

  snake1 = new Snake('bob', 1, tail, 'right', 1, 5, 5);
  xpos = 4;
  ypos = 5;
  tail = [
    [xpos, ypos],
    [xpos - 1, ypos],
    [xpos - 2, ypos],
    [xpos - 3, ypos],
    [xpos - 4, ypos]
  ];
  snake2 = new Snake('gorge', 2, tail, 'left', 1, 4, 4, '#0000FF');
  snakes.push(snake1);
  // snakes.push(snake2);

  getdomelements();

  createfield();

  generatefruit();
  generatecandy();

  handlekeydowns();
  gametick();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
