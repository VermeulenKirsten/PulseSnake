// ***********  Variables ***********

let domBack;

// ***********  DOM references ***********

const doms = function() {
  domBack = document.querySelector('.js-back');
};
// ***********  Navigation ***********

const goToIndex = function() {
  window.location.href = 'index.html';
};

// ***********  Eventlisteners ***********

const eventListeners = function() {
  domBack.addEventListener('click', goToIndex);
};

// *********** Init / DOMContentLoaded ***********

const init = function() {
  doms();
  eventListeners();
};

document.addEventListener('DOMContentLoaded', init);
