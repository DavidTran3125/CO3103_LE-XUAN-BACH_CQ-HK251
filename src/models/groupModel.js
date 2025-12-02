const {connectDB,sql} = require('../config/db')

exports.add_db_grouplearning = async ({group_name,description,max_member,chat_type,created_id}) =>{
    try {
        const pool=await connectDB();
        stringsql=`
            insert into LearningGroup(Group_Name, Description,Chat_Type, Max_Members, Created_by)
            values(@group_name,@description,@chat_type,@max_member,@created_id)
            `
        await pool.request()
            .input('group_name',sql.NVarChar,group_name)
            .input('description',sql.NVarChar,description)
            .input('max_member',sql.Int,max_member || 10)
            .input('chat_type',sql.NVarChar,chat_type)
            .input('created_id',sql.Int,created_id)
            .query(stringsql);
        return;
    } catch (err) {
        console.log(err);
        throw err;
    }
}