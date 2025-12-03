const {connectDB,sql}= require('../config/db')

// const usermodel=require('./userModel')

exports.save_message = async (raw_message) =>{
    const pool =await connectDB();
    const {roomId,senderId,message}=raw_message;
    try {
        const stringsql=`
            insert into Message(Group_ID,User_ID,Content) 
            values (@gropuid,@userid,@contnet)`
        
        await pool.request()
            .input('gropuid',sql.Int,roomId)
            .input('userid',sql.Int,senderId)
            .input('contnet',sql.NVarChar,message)
            .query(stringsql);
        return;
    } catch (err) {
        throw err;
    }
}

// exports.get_list_message = async (gropuid)=>{
//     try {
//         const pool =await connectDB();
//         const stringsql=`
//             select* from Message where Group_ID= @groupid`;
//         const result= await pool.request()
//             .input('groupid',sql.Int,gropuid)
//             .query(stringsql);
//         return result.recordset;
//     } catch (err) {
//         throw err;
//     }
// }

exports.get_list_message = async (groupid, page = 1, pageSize = 20) => {
    try {
        const pool = await connectDB();

        const offset = (page - 1) * pageSize;

        const stringsql = `
            SELECT m.*,u.Username as username
            FROM 
            (
               select * from Message WHERE Group_ID = @groupid
            ) m join User_Profile u on u.User_ID = m.User_ID
            ORDER BY Created_at DESC      -- tin nhắn mới nhất lên đầu
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        const result = await pool.request()
            .input('groupid', sql.Int, groupid)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, pageSize)
            .query(stringsql);

        return result.recordset;
    } catch (err) {
        throw err;
    }
};
