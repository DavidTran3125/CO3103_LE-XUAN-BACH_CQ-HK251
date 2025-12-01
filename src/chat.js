
const http = require("http");
const { Server } = require("socket.io");
// const cors = require("cors");
const express=require('express')
// const app= require('./src/app')

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
    console.log(msg)
    io.to(msg.roomId).emit("server_client", msg)
    // io.emit("chat_all_message", msg);
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);  
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

module.exports = chatserver;

