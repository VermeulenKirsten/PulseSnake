// const ip = "127.0.0.1:5000";
// const socketio = io.connect(ip);

let inputbuffer = [];
let gamefield = [[]];
let stop = false;
let snake1;
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
  obj.xpos = xpos;
  obj.ypos = ypos;
  return obj;
}
// ***********  Event Listeners ***********
const handlekeydowns = function() {
  document.addEventListener('keydown', function(key) {
    // console.log('keypress');

    if (key.which === 37) {
      inputbuffer.push('left');
      console.log(key.which);
    } else if (key.which === 38) {
      console.log(key.which);
      inputbuffer.push('up');
    } else if (key.which === 39) {
      console.log(key.which);
      inputbuffer.push('right');
    } else if (key.which === 40) {
      console.log(key.which);
      inputbuffer.push('down');
    }
    //stop knop
    else if (key.which === 32) {
      console.log(key.which);
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
  console.log('create field');
  for (let x = 0; x < 10; x++) {
    gamefield.push([]);
    for (let y = 0; y < 10; y++) {
      gamefield[x].push(0);
    }
  }
};

const displayinconsole = function() {
  console.log('display in console');

  let input = inputbuffer.shift();
  if (input == 'down') {
    snake1.xpos += 1;
  } else if (input == 'up') {
    snake1.xpos -= 1;
  } else if (input == 'left') {
    snake1.ypos -= 1;
  } else if (input == 'right') {
    snake1.ypos += 1;
  }
  gamefield[snake1.xpos][snake1.ypos] = 1;
  console.table(gamefield);
  console.log(inputbuffer);
  if (!stop) {
    setTimeout(displayinconsole, 2000);
  }
};
const gametick = function() {
  displayinconsole();
};

// ***********  Init / DOMContentLoaded ***********
const init = function() {
  console.log('init');
  snake1 = createsnake('bob', 1, 1, 5, 5);

  createfield();
  handlekeydowns();
  gametick();
};
document.addEventListener('DOMContentLoaded', function() {
  init();
});
