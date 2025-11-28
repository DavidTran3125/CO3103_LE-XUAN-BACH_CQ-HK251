
const express=require('express');
// const {conn,sql} = require('./config/db')

const app=express();
app.use(express.json());  

app.get('',(req,res)=>{
        res.send("huyyy")
})

require('./routers/authRouter')(app);
require('./routers/userRouter')(app);

module.exports = app