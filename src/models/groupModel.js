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
            Max_Members AS maxMembers,
            Chat_Type  AS chatType,
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

exports.user_exists = async (userId) => {
  try {
    const pool = await connectDB();
    const stringsql = `SELECT 1 AS ok FROM User_Profile WHERE User_ID = @userId`;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(stringsql);

    return result.recordset.length > 0;
  } catch (err) {
    throw err;
  }
};

exports.is_user_in_group = async (userId, groupId) => {
  try {
    const pool = await connectDB();
    const stringsql = `
      SELECT 1 AS ok
      FROM Membership
      WHERE User_ID = @userId AND Group_ID = @groupId
    `;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('groupId', sql.Int, groupId)
      .query(stringsql);

    return result.recordset.length > 0;
  } catch (err) {
    throw err;
  }
};

exports.get_pending_invite = async (groupId, toUserId) => {
  try {
    const pool = await connectDB();
    const stringsql = `
      SELECT TOP 1 Invite_ID
      FROM Group_Invite
      WHERE Group_ID = @groupId
        AND To_User_ID = @toUserId
        AND Status = 'pending'
      ORDER BY Created_at DESC
    `;
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('toUserId', sql.Int, toUserId)
      .query(stringsql);

    return result.recordset[0]?.Invite_ID || null;
  } catch (err) {
    throw err;
  }
};

exports.create_group_invite = async ({ groupId, fromUserId, toUserId }) => {
  try {
    const pool = await connectDB();
    const stringsql = `
      INSERT INTO Group_Invite (Group_ID, From_User_ID, To_User_ID, Status)
      OUTPUT INSERTED.Invite_ID
      VALUES (@groupId, @fromUserId, @toUserId, 'pending')
    `;
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('fromUserId', sql.Int, fromUserId)
      .input('toUserId', sql.Int, toUserId)
      .query(stringsql);

    return result.recordset[0]?.Invite_ID;
  } catch (err) {
    throw err;
  }
};

exports.count_group_members = async (groupId) => {
  try {
    const pool = await connectDB();
    const stringsql = `SELECT COUNT(*) AS cnt FROM Membership WHERE Group_ID = @groupId`;
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(stringsql);

    return result.recordset[0]?.cnt ?? 0;
  } catch (err) {
    throw err;
  }
};

exports.get_user_role_in_group = async (userId, groupId) => {
  try {
    const pool = await connectDB();
    const stringsql = `
      SELECT Role
      FROM Membership
      WHERE User_ID = @userId AND Group_ID = @groupId
    `;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('groupId', sql.Int, groupId)
      .query(stringsql);

    return result.recordset[0]?.Role || null;
  } catch (err) {
    throw err;
  }
};

exports.remove_member = async (groupId, userId) => {
  try {
    const pool = await connectDB();
    const stringsql = `
      DELETE FROM Membership
      WHERE Group_ID = @groupId AND User_ID = @userId
    `;
    await pool.request()
      .input('groupId', sql.Int, groupId)
      .input('userId', sql.Int, userId)
      .query(stringsql);
    return;
  } catch (err) {
    throw err;
  }
};

exports.delete_group = async (groupId) => {
  try {
    const pool = await connectDB();

    const deleteGroupSql = `
      DELETE FROM LearningGroup WHERE ID = @groupId
    `;
    await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(deleteGroupSql);

    return;
  } catch (err) {
    throw err;
  }
};