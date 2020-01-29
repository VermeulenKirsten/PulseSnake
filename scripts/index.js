// ***********  Variables ***********

let domPlay, domScoreboard, domCredits, domSettings;

// ***********  DOM references ***********

const doms = function() {
  domPlay = document.querySelector('.js-play');
  domScoreboard = document.querySelector('.js-scoreboard');
  domCredits = document.querySelector('.js-credits');
  domSettings = document.querySelector('.js-settings');
};

// ***********  Navigation ***********

const goToPlay = function() {
  window.location.href = 'play.html';
};

const goToScoreboard = function() {
  window.location.href = 'scoreboard.html';
};

const goToCredits = function() {
  window.location.href = 'credits.html';
};

const goToSettings = function() {
  window.location.href = 'settings.html';
};

// ***********  Eventlisteners ***********

const eventListeners = function() {
  domPlay.addEventListener('click', goToPlay);
  domScoreboard.addEventListener('click', goToScoreboard);
  domCredits.addEventListener('click', goToCredits);
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
