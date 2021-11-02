const socket = io();
const $messageForm = document.querySelector("#message-form"); 
const $messageFormInput = $messageForm.querySelector("input"); 
const $messageFormButton = $messageForm.querySelector("button"); 
const $sendLocatinButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages"); 

const mesagesTemplate = document.querySelector("#message-template").innerHTML; 
const locationTemplate = document.querySelector("#location-template").innerHTML; 
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML; 

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  $newMessage = $messages.lastElementChild; 
  const newMessageStyle = getComputedStyle($newMessage); 
  const newMessageMargin = parseInt(newMessageStyle.marginBottom); 
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; 

  const visibelHeight = $messages.offsetHeight; 

  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibelHeight;

  if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight; 
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(mesagesTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm a"),
  }); 
  $messages.insertAdjacentHTML("beforeend", html); 
  autoscroll();
});

socket.on("locationMessage", (location) => {
  console.log(location);
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("HH:mm a"),
  }); 
  $messages.insertAdjacentHTML("beforeend", html); 
  autoscroll(); 
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  }); 
  document.querySelector("#sidebar").innerHTML = html; 
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled"); 

  const message = e.target.elements.message.value; 
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled"); 
    $messageFormInput.value = ""; 
    $messageFormInput.focus(); 
    if (error) {
      return console.log(error); 
    }
    console.log("the message has been delivered");
  });
});

$sendLocatinButton.addEventListener("click", () => {
  $sendLocatinButton.setAttribute("disabled", "disabled"); 
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocatinButton.removeAttribute("disabled"); 
        console.log("Location has been shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; 
  }
});
