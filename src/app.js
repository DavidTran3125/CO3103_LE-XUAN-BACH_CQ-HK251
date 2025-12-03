
const express=require('express');
const cors = require('cors')
// const {conn,sql} = require('./config/db')

const app=express();
app.use(cors())
app.use(express.json());  

app.get('',(req,res)=>{
        res.send("hello world")
})

require('./routers/authRouter')(app);
require('./routers/userRouter')(app);
require('./routers/groupRouter')(app);
require('./routers/chatRouter')(app);

module.exports = app