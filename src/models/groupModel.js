const {connectDB,sql} = require('../config/db')

exports.add_db_grouplearning = async ({group_name,description,max_member,chat_type,created_id}) =>{
    try {
        const pool=await connectDB();
        stringsql=`
            insert into LearningGroup(Group_Name, Description,Chat_Type, Max_Members, Created_by)
            output INSERTED.ID
            values(@group_name,@description,@chat_type,@max_member,@created_id)
            `
        const gr =await pool.request()
            .input('group_name',sql.NVarChar,group_name)
            .input('description',sql.NVarChar,description)
            .input('max_member',sql.Int,max_member || 10)
            .input('chat_type',sql.NVarChar,chat_type)
            .input('created_id',sql.Int,created_id)
            .query(stringsql);
        return gr.recordset[0] ||null;
    } catch (err) {
        // console.log(err);
        throw err;
    }
}

exports.add_membership = async ({userid,groupid,role})=>{
    try {
        const pool =await connectDB();
        stringsql=`
            insert into Membership(User_ID,Group_ID,Role)
            values(@userid,@groupid,@role)`;
        await pool.request()
        .input('userid',sql.Int,userid)
        .input('groupid',sql.Int,groupid)
        .input('role',sql.NVarChar,role)
        .query(stringsql);
        return;
    } catch (err) {
        // console.log(err);
        throw err;
    }
}

exports.get_list_group = async (userid) => {
    try {
        const pool= await connectDB();
        stringsql=`
        select m.Group_ID, l.Group_Name, l.Created_at, l.Description
        from Membership m,LearningGroup l
        where m.Group_ID = l.ID and m.User_ID=@userid`;
        const result= await pool.request()
            .input('userid',sql.Int,userid)
            .query(stringsql);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

exports.get_group_by_id = async (groupId) => {
    try {
        const pool = await connectDB();
        const query = `
            SELECT 
                ID         AS groupId,
                Group_Name AS groupName,
                Created_at AS createdAt
            FROM LearningGroup
            WHERE ID = @groupId
        `;
        const result = await pool.request()
            .input('groupId', sql.Int, groupId)
            .query(query);

        return result.recordset[0] || null;
    } catch (err) {
        throw err;
    }
};

exports.get_group_members = async (groupId) => {
    try {
        const pool = await connectDB();
        const query = `
            SELECT 
                u.User_ID  AS userId,
                u.Username AS username,
                m.Role     AS role
            FROM Membership m
            JOIN User_Profile u ON u.User_ID = m.User_ID
            WHERE m.Group_ID = @groupId
            ORDER BY CASE WHEN m.Role = 'group_leader' THEN 0 ELSE 1 END, u.Username
        `;
        const result = await pool.request()
            .input('groupId', sql.Int, groupId)
            .query(query);

        return result.recordset;
    } catch (err) {
        throw err;
    }
};