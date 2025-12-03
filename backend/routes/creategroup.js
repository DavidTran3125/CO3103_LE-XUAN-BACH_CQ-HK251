const sql = require('mssql');
const config = require('../config');

async function handleCreateGroup(req, res) {
  try {
    const userId = req.user.id;
    const { groupname, groupcode } = req.body;

    if (!groupname || !groupcode) {
      return res.status(400).json({ message: 'Thiếu thông tin groupname hoặc groupcode' });
    }

    const pool = await sql.connect(config);

    // Tạo nhóm mới
    const groupResult = await pool.request()
      .input('groupname', sql.NVarChar(30), groupname)
      .input('groupcode', sql.VarChar(30), groupcode)
      .query(`
        INSERT INTO Groups (groupname, groupcode)
        VALUES (@groupname, @groupcode);

        SELECT SCOPE_IDENTITY() AS group_id;
      `);

    const groupId = groupResult.recordset[0].group_id;

    // Thêm người tạo vào bảng Member với vai trò leader
    await pool.request()
      .input('group_id', sql.Int, groupId)
      .input('user_id', sql.Int, userId)
      .input('role', sql.VarChar(20), 'leader')
      .query(`
        INSERT INTO Member (group_id, user_id, role)
        VALUES (@group_id, @user_id, @role);
      `);

    // Gán toàn bộ quyền cho người tạo nhóm
    await pool.request()
      .input('group_id', sql.Int, groupId)
      .input('user_id', sql.Int, userId)
      .input('can_invite', sql.Bit, 1)
      .input('can_send', sql.Bit, 1)
      .input('can_edit_permissions', sql.Bit, 1)
      .input('can_remove_member', sql.Bit, 1)
      .query(`
        INSERT INTO Permission (group_id, user_id, can_invite, can_send, can_edit_permissions, can_remove_member)
        VALUES (@group_id, @user_id, @can_invite, @can_send, @can_edit_permissions, @can_remove_member);
      `);

    res.status(201).json({
      message: 'Tạo nhóm thành công',
      group_id: groupId,
      groupname,
      groupcode
    });
  } catch (err) {
    console.error('Lỗi khi tạo nhóm:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleCreateGroup };