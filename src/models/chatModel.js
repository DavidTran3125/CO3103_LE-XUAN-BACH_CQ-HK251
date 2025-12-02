const {connectDB,sql}= require('../config/db')

// const usermodel=require('./userModel')

exports.save_message = async (raw_message) =>{
    const pool =await connectDB();
    const {roomId,userid,message}=raw_message;
    try {
        const stringsql=`
            insert into Message(Group_ID,User_ID,Content) 
            values (@gropuid,@userid,@contnet)`
        
        await pool.request()
            .input('gropuid',sql.Int,roomId)
            .input('userid',sql.Int,userid)
            .input('contnet',sql.NVarChar,message)
            .query(stringsql);
        return;
    } catch (err) {
        throw err;
    }
}