const sql = require('mssql');
const config = require('../config');

async function handleLeaveMember(req, res) {
  try {
    const pool = await sql.connect(config);
    const { group_id } = req.body;
    const user_id = req.user.id; // lấy từ cookie đã xác thực

    if (!group_id) {
      return res.status(400).json({ message: 'Thiếu group_id' });
    }

    // Kiểm tra vai trò của user trong nhóm
    const checkRole = await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT role FROM Member
        WHERE group_id = @group_id AND user_id = @user_id
      `);

    if (checkRole.recordset.length === 0) {
      return res.status(403).json({ message: 'Bạn không thuộc nhóm này' });
    }

    const role = checkRole.recordset[0].role;
    if (role === 'leader') {
      return res.status(403).json({ message: 'Leader không thể rời nhóm' });
    }

    // Kiểm tra số lượng thành viên trong nhóm
    const countResult = await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`
        SELECT COUNT(*) AS memberCount
        FROM Member
        WHERE group_id = @group_id
      `);

    const memberCount = countResult.recordset[0].memberCount;

    if (memberCount === 1) {
      // Nếu chỉ còn 1 thành viên (chính user này) -> xóa nhóm
      await pool.request()
        .input('group_id', sql.Int, group_id)
        .query(`DELETE FROM Member WHERE group_id = @group_id`);

      await pool.request()
        .input('group_id', sql.Int, group_id)
        .query(`DELETE FROM Groups WHERE group_id = @group_id`);

      return res.status(200).json({ message: 'Bạn là thành viên cuối cùng, nhóm đã bị xóa' });
    } else {
      // Nếu còn nhiều thành viên → chỉ xóa user khỏi nhóm
      await pool.request()
        .input('group_id', sql.Int, group_id)
        .input('user_id', sql.Int, user_id)
        .query(`DELETE FROM Member WHERE group_id = @group_id AND user_id = @user_id`);

      return res.status(200).json({ message: 'Bạn đã rời khỏi nhóm' });
    }

  } catch (err) {
    console.error('Lỗi khi rời nhóm:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleLeaveMember };