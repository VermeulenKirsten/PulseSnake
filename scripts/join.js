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

//check if there are errors that need to be displayed
const checkErrors = function() {
  var url = new URL(window.location.href);
  let error = url.searchParams.get('error');
  if (error == 'roomNotFound') {
    console.log('room was not found');
  } else if (error == 'roomFull') {
    console.log('room was full');
  }
};

const init = function() {
  getdom();
  checkErrors();
};

document.addEventListener('DOMContentLoaded', function() {
  init();
});
