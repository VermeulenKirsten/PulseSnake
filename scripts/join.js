let inputfield;

//events
const joinroom = function() {
  console.log(inputfield.value);
  window.location.href = `http://127.0.0.1:5500/playerroom.html?roomId=${inputfield.value}`;
  return false;
};

//dom elements
const getdom = function() {
  console.log('getdom');
  inputfield = document.querySelector('#roomcodejs');
  document.querySelector('#js-form').addEventListener('submit', joinroom);
};

const init = function() {
  getdom();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
