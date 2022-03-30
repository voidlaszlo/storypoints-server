const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const JOIN_ROOM_EVENT = "JOIN_ROOM";
const POST_DATA_EVENT = "POST_DATA";
const POST_TITLE_EVENT = "POST_TITLE";
const GET_STATE_EVENT = "GET_STATE";
const CLEAR_STATE_EVENT = "CLEAR_STATE";

const state = {};

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(`User Disconnected`);
  });

  socket.on(JOIN_ROOM_EVENT, (roomId) => {
    socket.join(roomId);

    if (state[roomId] !== undefined) {
      io.to(socket.id).emit(
        POST_TITLE_EVENT,
        state[roomId].dataSets[state[roomId].dataSets.length - 1].title
      );
    }
  });

  socket.on(POST_DATA_EVENT, (selected, room) => {
    state[room].dataSets[state[room].dataSets.length - 1].data.push({
      socketId: socket.id,
      selected,
    });
  });

  socket.on(POST_TITLE_EVENT, (title) => {
    if (state[socket.id] === undefined) {
      state[socket.id] = {
        dataSets: [],
      };
    }

    state[socket.id].dataSets.push({
      title,
      data: [],
    });

    io.to(socket.id).emit(POST_TITLE_EVENT, title);
  });

  socket.on(GET_STATE_EVENT, () => {
    io.to(socket.id).emit(
      POST_DATA_EVENT,
      state[socket.id].dataSets[state[socket.id].dataSets.length - 1].data
    );
  });

  socket.on(CLEAR_STATE_EVENT, () => {
    console.log(state[socket.id]);
    io.to(socket.id).emit(POST_DATA_EVENT, []);
    io.to(socket.id).emit(POST_TITLE_EVENT, "");
  });

  // TODO: delete state[socket.id];
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
