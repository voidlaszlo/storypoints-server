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

const savedStates = [];

/*
{
  uuid: {
    dataSets: [
      {
        title:'',
        data: [
          {
            socketId: '',
            selected:
          }
        ]
      }
    ]
  }
}

*/
const state = {
  title: "",
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("disconnect", (socket) => {
    console.log(`User Disconnected`);
  });

  socket.on(JOIN_ROOM_EVENT, (roomId) => {
    socket.join(roomId);
  });

  socket.on(POST_DATA_EVENT, (selected, room) => {
    state[room].data.push({ socketId: socket.id, selected });
  });

  socket.on(POST_TITLE_EVENT, (title) => {
    state.title = title;
    state[socket.id] = {
      data: [],
    };
    io.to(socket.id).emit(POST_TITLE_EVENT, state.title);
  });

  socket.on(GET_STATE_EVENT, () => {
    io.to(socket.id).emit(POST_DATA_EVENT, state[socket.id].data);
  });

  socket.on(CLEAR_STATE_EVENT, () => {
    //savedStates[socket.id] = { data: state[socket.id].data };
    //delete state[socket.id];
    io.to(socket.id).emit(POST_DATA_EVENT, []);
    io.to(socket.id).emit(POST_TITLE_EVENT, "");
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
