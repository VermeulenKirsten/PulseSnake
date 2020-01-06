const ip = "127.0.0.1:5000";
const socketio = io.connect(ip);

// ***********  DOM references ***********

// ***********  HTML Generation ***********

// ***********  Callback ***********

// ***********  Data Access ***********
const handleData = async function(url, callback, method = "GET", body = null) {
  const get = await fetch(url, { method: method, body: body, headers: { "content-type": "application/json" } });
  const json = await get.json();
  callback(json);
};

// ***********  Event Listeners ***********

// ***********  Init / DOMContentLoaded ***********

document.addEventListener("DOMContentLoaded", function() {
  init();
});
