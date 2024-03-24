const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const users = {};
let videoState = { playing: false, currentTime: 0 };

io.on("connection", (socket) => {
  // User joins the room
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("updateUsers", Object.values(users));
    socket.broadcast.emit("message", `${username} has joined the room`);
    socket.emit("videoSync", videoState);
  });

  // User sends a chat message
  socket.on("chatMessage", (message) => {
    io.emit("message", `${users[socket.id]}: ${message}`);
  });

   // User plays, pauses, or seeks the video
  socket.on('videoControl', (data) => {
    videoState = data;
    io.emit('videoControl', data);
  });

  // User leaves the room
  socket.on("disconnect", () => {
    io.emit("message", `${users[socket.id]} has left the room`);
    delete users[socket.id];
    io.emit("updateUsers", Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
// Use local IPV4 address for testing
server.listen(PORT,'192.168.142.57', () => {
  console.log(`Server is running on port ${PORT}`);
});
