
const http = require("http");
const { Server } = require("socket.io");
const express=require('express')

const chatController = require('./controllers/chatController')

const chatserver=http.createServer(express())
const io = new Server(chatserver, {
  cors: {
    // origin: "http://localhost:5173",
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("client_server", (msg) => {
    chatController.handel_message(io,msg);
  });

  socket.on("join_room", (list_group ) => {
    if (!Array.isArray(list_group)) return;
    // console.log("list_group")
    list_group.forEach(roomId => {
      if (roomId) socket.join(roomId);
      // console.log(`${socket.id} joined room ${roomId}`);
    });
  });
  // socket.on("join_room", (list_group ) =>{
  //   socket.join(list_group);
  //   console.log(`${socket.id} joined room ${list_group}`);
  // })


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

module.exports = chatserver;

// chatserver.listen(4000, '0.0.0.0' ,() =>{
//         console.log(` chatServer running on port ${4000}`);
//     });