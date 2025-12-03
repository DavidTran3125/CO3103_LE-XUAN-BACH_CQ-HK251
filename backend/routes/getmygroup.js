const sql = require('mssql');
const config = require('../config');

async function handleGetMyGroups(req, res) {
  try {
    const userId = req.user.id;

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT g.group_id, g.groupname, g.groupcode, g.created_at, m.role
        FROM Member m
        JOIN Groups g ON m.group_id = g.group_id
        WHERE m.user_id = @user_id
        ORDER BY g.created_at DESC
      `);

    res.status(200).json({
      message: 'Lấy danh sách nhóm thành công',
      groups: result.recordset.map(g => ({
        group_id: g.group_id,
        groupname: g.groupname,
        groupcode: g.groupcode,
        created_at: g.created_at,
        role: g.role
      }))
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách nhóm:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetMyGroups };