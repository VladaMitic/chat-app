const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages"); 

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users"); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

io.on("connection", (socket) => {
  console.log("New websocket connecion");

  socket.on("join", ({ username, room }, callBack) => {
    const { error, user } = addUser({ id: socket.id, username, room }); 
    if (error) {
      return callBack(error); 
    }
    socket.join(user.room);

    socket.emit("message", generateMessage('Admin', "Welcome!")); 

    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage('Admin', `${user.username} has joined!`)); 
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    }); 
    callBack(); 
  });

  socket.on("sendMessage", (clientMessage, callBack) => {
    const user = getUser(socket.id);
    const filter = new Filter(); 
    if (filter.isProfane(clientMessage)) {
      return callBack("Profanity is not allowed"); 
    }
    io.to(user.room).emit("message", generateMessage(user.username, clientMessage)); //reemitujemo poruko dobijenu od klijenta svim konektovanim klijentima odredjenog room-a. Salje i timestamp, zato je objekat sa dva propertija. Ali umestod a svaki put rucno kreiramo objekat koji s eprosledjuje, prethodno napravimo funkciju koja c egenerisati taj objekat(u utils folderu), a ovde je pozivamo. Poruku reemitujemos amo klijentima koji su u room-u
    callBack(); 
  });

  socket.on("sendLocation", (position, callBack) => {
    const user = getUser(socket.id); 
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      ) 
    );
    callBack(); 
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id); 
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left the room`)
      ); 
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      }); 
    }
  });
});

server.listen(port, () => {
  console.log(`App running on port ${port}`);
});
