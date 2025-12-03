const { connect } = require('mssql');
const {handleSqlError} = require('../middlewares/handleErrorSQL')
const groupmodel= require('../models/groupModel');
const { connectDB } = require('../config/db');

exports.create_group = async (req,res) =>{
    const id = req.user.id;
    const input = req.body;
    input.created_id=id;
    // console.log(input)
    try {
        const group_id= await groupmodel.add_db_grouplearning(input);
        await groupmodel.add_membership({
            userid: id,
            groupid: group_id.ID,
            role: input.chat_type==="Personal" ?"member":"group_leader"
        })
        res.json({
            status: "success",
            message: "tạo chat area  thành công",
            data:{
                Group_ID: group_id.ID
            }
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.get_list_group = async (req,res)=>{
    try {
        const userid= req.user.id;
        const result= await groupmodel.get_list_group(userid);
        return res.json({
            status:"success",
            data: result
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}