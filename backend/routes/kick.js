const sql = require('mssql');
const config = require('../config');

async function handleKickMember(req, res) {
  try {
    const pool = await sql.connect(config);
    const kickerId = req.user.id; // người thực hiện kick
    const { group_id, member_id } = req.body;

    if (!group_id || !member_id) {
      return res.status(400).json({ message: 'Thiếu group_id hoặc member_id' });
    }

    // Kiểm tra xem người kick có quyền không (ví dụ: leader hoặc có quyền remove_member)
    const permissionCheck = await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, kickerId)
      .query(`
        SELECT role, can_remove_member
        FROM Member m
        LEFT JOIN Permission p ON m.group_id = p.group_id AND m.user_id = p.user_id
        WHERE m.group_id = @group_id AND m.user_id = @user_id
      `);

    if (permissionCheck.recordset.length === 0) {
      return res.status(403).json({ message: 'Bạn không thuộc nhóm này' });
    }

    const { role, can_remove_member } = permissionCheck.recordset[0];
    if (role !== 'leader' && can_remove_member !== true) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên' });
    }

    // Xóa thành viên khỏi bảng Member
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('member_id', sql.Int, member_id)
      .query(`
        DELETE FROM Member WHERE group_id = @group_id AND user_id = @member_id
      `);

    // Xóa quyền của thành viên khỏi bảng Permission
    await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('member_id', sql.Int, member_id)
      .query(`
        DELETE FROM Permission WHERE group_id = @group_id AND user_id = @member_id
      `);

    // Lấy username của người kick
    const kickerInfo = await pool.request()
      .input('user_id', sql.Int, kickerId)
      .query(`SELECT username FROM Users WHERE user_id = @user_id`);

    const kickerUsername = kickerInfo.recordset[0].username;

    // Tạo notification cho người bị kick
    const notificationContent = `Bạn đã bị ${kickerUsername} xóa khỏi nhóm`;

    await pool.request()
      .input('user_id', sql.Int, member_id)
      .input('content', sql.NVarChar(sql.MAX), notificationContent)
      .query(`
        INSERT INTO Notification (user_id, content)
        VALUES (@user_id, @content)
      `);

    res.status(200).json({ message: 'Thành viên đã bị xóa khỏi nhóm và thông báo đã được gửi' });
  } catch (err) {
    console.error('Lỗi khi kick thành viên:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleKickMember };