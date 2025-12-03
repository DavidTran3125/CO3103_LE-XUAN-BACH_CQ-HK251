const sql = require('mssql');
const config = require('../config');

async function handleDeleteGroup(req, res) {
  try {
    const pool = await sql.connect(config);
    const { group_id } = req.body;
    const user_id = req.user.id;

    if (!group_id) {
      return res.status(400).json({ message: 'Thiếu group_id' });
    }

    // Kiểm tra xem user có phải leader của nhóm không
    const checkLeader = await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT role FROM Member
        WHERE group_id = @group_id AND user_id = @user_id
      `);

    if (checkLeader.recordset.length === 0) {
      return res.status(403).json({ message: 'Bạn không thuộc nhóm này' });
    }

    if (checkLeader.recordset[0].role !== 'leader') {
      return res.status(403).json({ message: 'Chỉ leader mới có quyền xóa nhóm' });
    }

    // Xóa tất cả request liên quan đến group
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`DELETE FROM Grequest WHERE group_id = @group_id`);

    // Xóa tất cả message liên quan đến group
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`DELETE FROM Message WHERE group_id = @group_id`);

    // Xóa tất cả permission liên quan đến group
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`DELETE FROM Permission WHERE group_id = @group_id`);

    // Xóa tất cả thành viên trong nhóm
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`DELETE FROM Member WHERE group_id = @group_id`);

    // Cuối cùng xóa nhóm
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`DELETE FROM Groups WHERE group_id = @group_id`);

    res.status(200).json({ message: 'Xóa nhóm thành công' });

  } catch (err) {
    console.error('Lỗi khi xóa nhóm:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleDeleteGroup };