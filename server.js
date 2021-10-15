const express = require("express");
const { isObject } = require("util");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")().listen(server).sockets;
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let connectedUser = [];
io.on("connection", (socket) => {
  console.log("one user connected");

  updateUserName();
  let userName = "";

  //login
  socket.on("login", (name, callback) => {
    if (name.trim().length === 0) {
      return;
    }
    callback(true);
    userName = name;
    connectedUser.push(userName);
    console.log(connectedUser);
    updateUserName();
  });
  socket.on("disconnect", () => {
    console.log("one user disconnected");
    connectedUser.splice(connectedUser.indexOf(userName), 1);
    console.log(connectedUser);
    updateUserName();
  });

  //receive chat message
  socket.on("chat message", (msg) => {
    //emit message data
    io.emit("output", {
      name: userName,
      msg: msg,
    });
  });

  function updateUserName() {
    io.emit("loadUser", connectedUser);
  }
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server is running on port ${port}`));
