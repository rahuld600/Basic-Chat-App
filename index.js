const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function (socket) {
  console.log("a user connected");
  socket.on("join", function (data) {
    console.log("connected user: " + data.room);
    socket.join(data.room);
    io.sockets.in(data.room).emit("connected to room", {
      msg: data.name + " connected to " + data.room,
    });
  });

  socket.on("chat message", (msg) => {
    console.log(msg.room);
    io.sockets
      .in(msg.room)
      .emit("chat message", { msg: msg.message, from: msg.from });
    console.log("message: " + msg);
  });

  socket.on("leave", function (data) {
    console.log("user" + socket.id);
    console.log("user left: " + data.room);
    socket.leave(data.room);
    io.sockets
      .to(socket.id)
      .emit("leave message", { msg: "You left the room " + data.room });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on :3000");
});

module.exports = app;
