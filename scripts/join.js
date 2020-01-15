let domInput, domJoin;

// ***********  DOM references ***********
const doms = function() {
  domInput = document.querySelector(".js-code");
  domJoin = document.querySelector(".js-join");
  domBack = document.querySelector(".js-back");
};

// ***********  Check for errors and display  ***********
const checkErrors = function() {
  var url = new URL(window.location.href);
  let error = url.searchParams.get("error");
  if (error == "roomNotFound") {
    console.log("room was not found");
  } else if (error == "roomFull") {
    console.log("room was full");
  }
};

// ***********  Navigation ***********
const goToLobby = function() {
  window.location.href = `http://127.0.0.1:5500/playerroom.html?roomId=${domInput.value}`;
};

const goToPlay = function() {
  window.location.href = "play.html";
};

// ***********  EventListeners ***********
const eventListeners = function() {
  domJoin.addEventListener("submit", goToLobby);
  domBack.addEventListener("click", goToPlay);
};
// *********** Init / DOMContentLoaded ***********
const init = function() {
  doms();
  eventListeners();
  checkErrors();
};

document.addEventListener("DOMContentLoaded", init);
