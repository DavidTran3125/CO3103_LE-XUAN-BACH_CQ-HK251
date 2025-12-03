// const {handleSqlError} = require("../middlewares/handleErrorSQL")
const { handleSqlError } = require('../middlewares/handleErrorSQL');
const chatmodel=require('../models/chatModel')

exports.handel_message = (io,raw_message) =>{
    console.log(raw_message);
    io.to(raw_message.roomId).emit("server_client", raw_message);
    chatmodel.save_message(raw_message)
    .catch(err => console.error("SAVE MESSAGE ERROR", err));
}

exports.get_list_message = async (req,res) =>{
    try {
        const groupid= parseInt(req.params.groupID,10);
        const page= parseInt(req.params.page,10);
        // console.log(groupid,req.params.groupId);
        const result= await chatmodel.get_list_message(groupid,page);
        // result.Created_at=result.Created_at.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        return res.json({
            status:"success",
            data:result
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}