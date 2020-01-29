// ***********  Variables ***********

let domNewGame, domJoin, domBack;

// ***********  DOM references ***********

const doms = function() {
  domNewGame = document.querySelector('.js-newgame');
  domJoin = document.querySelector('.js-join');
  domBack = document.querySelector('.js-back');
};

// ***********  Navigation ***********

const goToCreate = function() {
  window.location.href = 'create.html';
};

const goToJoin = function() {
  window.location.href = 'join.html';
};

const goToIndex = function() {
  window.location.href = 'index.html';
};

// ***********  Eventlisteners ***********

const eventListeners = function() {
  domNewGame.addEventListener('click', goToCreate);
  domJoin.addEventListener('click', goToJoin);
  domBack.addEventListener('click', goToIndex);
};

// *********** Init / DOMContentLoaded ***********

const init = function() {
  doms();
  eventListeners();
};
if (location.protocol != 'http:') {
  location.href = 'http:' + window.location.href.substring(window.location.protocol.length);
}

document.addEventListener('DOMContentLoaded', init);
