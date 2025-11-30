require('dotenv').config();
const authmodel=require('../models/authModel')
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const SECRET = process.env.SECRET_KEY;
const {handleSqlError} = require("../middlewares/handleErrorSQL")

exports.login = async (req,res)=>{
    try {
        // const {username,password}=req.body;
        const username=req.body.username;
        const password=req.body.password;
        const users= await authmodel.get_user(username);
        const user=users.find(u => u.Password_hash===password);
        // console.log(users,users.password,);
        if (!user) return res.status(401).json({status:"fail", message: 'sai username or password' });
        // const pass=users.find(u => u.Password===password )
        // if (!pass) return res.status(401).json({ message: 'Invalid username or password' });

        const token = jwt.sign({ username: user.Username, id: user.User_ID}, SECRET, { expiresIn: '30m' });

        res.json(
        {
            Status:"success",
            message: "Đăng nhập thành công",
            token: token,
            user:{
                userID :user.User_ID,
                username: user.Username
            }
        });
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.signup = async (req,res)=>{
    try {
        const {username,password}=req.body;
        await authmodel.add_user(username,password);
        res.json({status:"success",message:"đăng kí thành công"});
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.test = async (req,res)=>{
    try {
        // const {username,password}=req.body;
        // const result= await authmodel.get_user(username);
        console.log(req.body)
        res.json(req.user.id);
    } catch (error) {
        res.status(500).json(error.message)

    }
}