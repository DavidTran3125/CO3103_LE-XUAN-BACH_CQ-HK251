// const {handleSqlError} = require("../middlewares/handleErrorSQL")
const chatmodel=require('../models/chatModel')

exports.handel_message = (io,raw_message) =>{
    console.log(raw_message);
    io.to(raw_message.roomId).emit("server_client", raw_message);
    chatmodel.save_message(raw_message)
    .catch(err => console.error("SAVE MESSAGE ERROR", err));
}