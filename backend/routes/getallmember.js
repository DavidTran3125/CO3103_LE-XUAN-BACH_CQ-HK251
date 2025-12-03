const sql = require('mssql');
const config = require('../config');

async function handleGetAllMember(req, res) {
  try {
    const pool = await sql.connect(config);
    const { group_id } = req.body;
    const user_id = req.user.id;

    if (!group_id) {
      return res.status(400).json({ message: 'Thiếu group_id' });
    }

    // Kiểm tra quyền truy cập (tùy chọn)
    const checkMember = await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT role FROM Member
        WHERE group_id = @group_id AND user_id = @user_id
      `);

    if (checkMember.recordset.length === 0) {
      return res.status(403).json({ message: 'Bạn không thuộc nhóm này' });
    }

    // Lấy danh sách thành viên
    const result = await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`
        SELECT m.user_id, u.username, u.first_name, u.last_name, m.role, m.join_at
        FROM Member m
        JOIN Users u ON m.user_id = u.user_id
        WHERE m.group_id = @group_id
        ORDER BY m.role DESC, m.join_at ASC
      `);

    res.status(200).json({
      message: 'Lấy danh sách thành viên thành công',
      members: result.recordset
    });

  } catch (err) {
    console.error('Lỗi khi lấy danh sách thành viên:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleGetAllMember };