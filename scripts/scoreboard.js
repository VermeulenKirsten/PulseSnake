// ***********  Variables ***********

let domBack, domSelector, domRadioButtons, domSelectortext;

// ***********  DOM references ***********

const doms = function() {
  domBack = document.querySelector(".js-back");
  domSelector = document.querySelector(".js-selector");
  domRadioButtons = document.querySelectorAll(".js-radio");
  domSelectortext = document.querySelector(".js-selectortext");
};

// ***********  Slider ***********
const moveSlider = function() {
  domRadioButtons.forEach(button => {
    if (button.checked) {
      domSelector.style.left = `${button.dataset.pos}%`;
      domSelectortext.innerHTML = button.value;
    }
  });
};

// ***********  Navigation ***********

const goToIndex = function() {
  window.location.href = "index.html";
};

// ***********  Eventlisteners ***********

const eventListeners = function() {
  domBack.addEventListener("click", goToIndex);
  domRadioButtons.forEach(button => {
    button.addEventListener("input", moveSlider);
  });
};

// *********** Init / DOMContentLoaded ***********

const init = function() {
  doms();
  eventListeners();
};

document.addEventListener("DOMContentLoaded", init);
