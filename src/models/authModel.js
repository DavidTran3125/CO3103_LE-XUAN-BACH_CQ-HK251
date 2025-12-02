
const {connectDB,sql} = require('../config/db')

exports.getall_user= async () => {
    try {
        const pool= await connectDB();
        const stringsql= `
            Select * from User_Profile`;
        const result= await pool.request()
            .query(stringsql);
        return result.recordset;

    } catch (error) {
        // console.log(error)
        throw error
    }
}

exports.get_user= async (name) => {
    try {
        const pool= await connectDB();
        const stringsql= `
            Select * from User_Profile where @username=Username`;
        const result= await pool.request()
            .input('username',sql.NVarChar,name)
            .query(stringsql);
        return result.recordset;

    } catch (error) {
        // console.log(error)
        throw error
    }
}

exports.add_user = async (name,pass) =>{
    try {
        const pool = await connectDB();
        const stringsql =`
            insert into User_Profile(Username,Password_hash) values (@username,@pass)`
        await pool.request()
            .input('username',sql.NVarChar,name)
            .input('pass',sql.NVarChar,pass)
            .query(stringsql);
    } catch (err) {
        // console.log(err)
        throw err
    }
}

exports.get_groupid = async (userid) => {
    const pool = await connectDB();
    try {
        const stringsql=`
            select Group_ID
            from Membership
            where @userid=User_ID`
        const listid= await pool.request()
            .input('userid',sql.Int,userid)
            .query(stringsql);
        return listid.recordset;
    } catch (err) {
        // console.log(err);
        throw err;
    }
}