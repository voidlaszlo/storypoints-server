const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { EVENTS } = require("./constants");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const state = {};

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(`User Disconnected`);
  });

  socket.on(EVENTS.JOIN_ROOM, (roomId) => {
    socket.join(roomId);

    if (state[roomId] !== undefined) {
      io.to(socket.id).emit(
        EVENTS.POST_TITLE,
        state[roomId].dataSets[state[roomId].dataSets.length - 1].title
      );
    }
  });

  socket.on(EVENTS.POST_DATA, (selected, room) => {
    state[room].dataSets[state[room].dataSets.length - 1].data.push({
      socketId: socket.id,
      selected,
    });
  });

  socket.on(EVENTS.POST_TITLE, (title) => {
    if (state[socket.id] === undefined) {
      state[socket.id] = {
        dataSets: [],
      };
    }

    state[socket.id].dataSets.push({
      title,
      data: [],
    });

    io.to(socket.id).emit(EVENTS.POST_TITLE, title);
  });

  socket.on(EVENTS.GET_STATE, () => {
    io.to(socket.id).emit(
      EVENTS.POST_DATA,
      state[socket.id].dataSets[state[socket.id].dataSets.length - 1].data
    );
  });

  socket.on(EVENTS.CLEAR_STATE, () => {
    io.to(socket.id).emit(EVENTS.POST_DATA, []);
    io.to(socket.id).emit(EVENTS.POST_TITLE, "");
  });

  // TODO: delete state[socket.id];
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
