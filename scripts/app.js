// const ip = "127.0.0.1:5000";
// const socketio = io.connect(ip);

let inputbuffer = ['right'];
let gamefield = [[]];
let stop = false;
let snake1;
let fruit;
// ***********  DOM references ***********

// ***********  HTML Generation ***********

// ***********  Callback ***********

// ***********  Data Access ***********
const handleData = async function(url, callback, method = 'GET', body = null) {
  const get = await fetch(url, { method: method, body: body, headers: { 'content-type': 'application/json' } });
  const json = await get.json();
  callback(json);
};

// ***********  Objects ***********
function createsnake(name, lenth, speed, xpos, ypos) {
  let obj = {};
  obj.tail = [
    [xpos, ypos],
    [xpos - 1, ypos],
    [xpos - 2, ypos],
    [xpos - 3, ypos],
    [xpos - 4, ypos]
  ];
  obj.isalive = true;
  return obj;
}
// ***********  Event Listeners ***********
//event that triggers when keyboard buttons are pressed
const handlekeydowns = function() {
  document.addEventListener('keydown', function(key) {
    let lastkey = inputbuffer[inputbuffer.length - 1];
    //left arrow key pressed
    if (key.which === 37) {
      if (lastkey != 'right' && lastkey != 'left') {
        inputbuffer.push('left');
      }
    }
    //up arrow key pressed
    else if (key.which === 38) {
      if (lastkey != 'down' && lastkey != 'up') {
        inputbuffer.push('up');
      }
    }
    //right arrow key pressed
    else if (key.which === 39) {
      if (lastkey != 'left' && lastkey != 'right') {
        inputbuffer.push('right');
      }
    }
    //down arrow key pressed
    else if (key.which === 40) {
      if (lastkey != 'up' && lastkey != 'down') {
        inputbuffer.push('down');
      }
    }
    //space bar pressed
    else if (key.which === 32) {
      if (stop) {
        stop = false;
      } else {
        stop = true;
      }
      displayinconsole();
    }
  });
};

// ***********  Core Game Mechanics ***********
const createfield = function() {
  // console.log('create field');
  gamefield = [];
  for (let x = 0; x < 10; x++) {
    gamefield.push([]);
    for (let y = 0; y < 10; y++) {
      gamefield[x].push(0);
    }
  }
};

const displayinconsole = function() {
  // console.log('display in console');
  let tailend;
  let newhead;
  let input = inputbuffer[0];
  if (inputbuffer.length > 1) {
    input = inputbuffer.shift();
  }
  try {
    if (input == 'down') {
      newhead = [snake1.tail[0][0] + 1, snake1.tail[0][1]];
      tailend = snake1.tail.pop();
      snake1.tail.unshift(newhead);
    } else if (input == 'up') {
      newhead = [snake1.tail[0][0] - 1, snake1.tail[0][1]];
      tailend = snake1.tail.pop();
      snake1.tail.unshift(newhead);
    } else if (input == 'left') {
      newhead = [snake1.tail[0][0], snake1.tail[0][1] - 1];
      tailend = snake1.tail.pop();
      snake1.tail.unshift(newhead);
    } else if (input == 'right') {
      newhead = [snake1.tail[0][0], snake1.tail[0][1] + 1];
      tailend = snake1.tail.pop();
      snake1.tail.unshift(newhead);
    }
    if (snake1.tail[0][1] < 0 || snake1.tail[0][1] > 9) {
      throw 'u dead';
    }
  } catch {
    snake1.isalive = false;
    console.log('u dead boi');
    stop = true;
  }
  // create empty field where we can re-draw everything
  createfield();
  // show te fruit we created before
  gamefield[fruit[0]][fruit[1]] = 2;

  // check if the snake ate the candy
  if (fruit[0] == newhead[0] && fruit[1] == newhead[1]) {
    snake1.tail.push(tailend);
    generatefruit();
  }

  //check if hte snfake ate himself
  for (let t = 1; t < snake1.tail.length; t++) {
    let tailpiece = snake1.tail[t];
    if (tailpiece[0] == newhead[0] && tailpiece[1] == newhead[1]) {
      stop = true;
      console.log('u dead boi!!');
    }
  }

  //show the location of the snake
  displaysnake(snake1);

  console.table(gamefield);
  if (!stop) {
    setTimeout(displayinconsole, 1500);
  }
};

const displaysnake = function(snakeobj) {
  // console.log('snakeopbject: ', snakeobj);
  try {
    for (let piece of snakeobj.tail) {
      gamefield[piece[0]][piece[1]] = 1;
    }
  } catch {
    snake1.isalive = false;
    console.log('u dead boi');
    stop = true;
  }
};
const gametick = function() {
  displayinconsole();
};

// ***********  generate fruit ***********
const generatefruit = function() {
  x = Math.floor(Math.random() * 9);
  y = Math.floor(Math.random() * 9);
  console.log('x: ', x, ' y: ', y);
  if (gamefield[x][y] == 0) {
    fruit = [x, y];
  } else {
    generatefruit();
  }
};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  snake1 = createsnake('bob', 1, 1, 5, 5);
  createfield();
  generatefruit();
  handlekeydowns();
  gametick();
  // generatefruit();
};
document.addEventListener('DOMContentLoaded', function() {
  init();
});
