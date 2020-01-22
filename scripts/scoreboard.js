// ***********  Variables ***********

let domBack, domSelector, domRadioButtons, domSelectortext, scoreboard;
let score, lenght, heartbeat, fruit, candy;
let scoreType = 'Score';
// ***********  DOM references ***********

const doms = function() {
  domBack = document.querySelector('.js-back');
  domSelector = document.querySelector('.js-selector');
  domRadioButtons = document.querySelectorAll('.js-radio');
  domSelectortext = document.querySelector('.js-selectortext');
  scoreboard = document.querySelector('.c-scoreboard');
};

// ***********  Slider ***********
const moveSlider = function() {
  domRadioButtons.forEach(button => {
    if (button.checked) {
      domSelector.style.left = `${button.dataset.pos}%`;
      domSelectortext.innerHTML = button.value;
      getScores(button.value);
      console.log(button.value);
      scoreType = button.value;
    }
  });
};

// ***********  Navigation ***********

const goToIndex = function() {
  window.location.href = 'index.html';
};

// ***********  Eventlisteners ***********

const eventListeners = function() {
  domBack.addEventListener('click', goToIndex);
  domRadioButtons.forEach(button => {
    button.addEventListener('input', moveSlider);
  });
};

const insertScores = function(scores) {
  console.log(scores);
  let newhtml = '';
  if (scoreType == 'Score') {
    for (index in scores) {
      newhtml += `<div class="c-input c-scoreboard__item">
    <p>${parseInt(index) + 1}. ${scores[index].name}</p>
    <p>${Math.round(scores[index].scorePerMinuut)}</p>
  </div>`;
    }
  } else {
    for (index in scores) {
      newhtml += `<div class="c-input c-scoreboard__item">
    <p>${parseInt(index) + 1}. ${scores[index].name}</p>
    <p>${scores[index].score}</p>
  </div>`;
    }
  }
  scoreboard.innerHTML = newhtml;
};

// ***********  get scores ***********
const getScores = async function(scoreType) {
  console.log(`https://kotsapi.azurewebsites.net/api/getScoreType/${scoreType}`);
  const get = await fetch(`https://kotsapi.azurewebsites.net/api/getScoreType/${scoreType}`);
  const scores = await get.json();
  insertScores(scores);
};

// *********** Init / DOMContentLoaded ***********

const init = function() {
  doms();
  eventListeners();
  getScores('Score');
};

document.addEventListener('DOMContentLoaded', init);
