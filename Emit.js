const { EVENTS } = require("./constants");

const Emit = {
  postTitle: (io, to, title) => {
    io.to(to).emit(EVENTS.POST_TITLE, title);
  },
  postData: (io, to, data) => {
    io.to(to).emit(EVENTS.POST_DATA, data);
  },
};

module.exports = {
  Emit,
};
