const sql = require('mssql');
const config = require('../config');

async function handleRequestGroup(req, res) {
  try {
    const pool = await sql.connect(config);
    const { group_id, receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!group_id || !receiver_id) {
      return res.status(400).json({ message: 'Thiếu group_id hoặc receiver_id' });
    }

    // Kiểm tra quyền mời của sender
    const checkPermission = await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, sender_id)
      .query(`
        SELECT can_invite FROM Permission
        WHERE group_id = @group_id AND user_id = @user_id
      `);

    if (checkPermission.recordset.length === 0) {
      return res.status(403).json({ message: 'Bạn không thuộc nhóm này hoặc chưa có quyền' });
    }

    if (checkPermission.recordset[0].can_invite !== true && checkPermission.recordset[0].can_invite !== 1) {
      return res.status(403).json({ message: 'Bạn không có quyền mời thành viên vào nhóm' });
    }

    // Lấy thông tin người gửi và nhóm để tạo nội dung thông báo
    const senderInfo = await pool.request()
      .input('user_id', sql.Int, sender_id)
      .query(`SELECT username FROM Users WHERE user_id = @user_id`);

    const groupInfo = await pool.request()
      .input('group_id', sql.Int, group_id)
      .query(`SELECT groupname, groupcode FROM Groups WHERE group_id = @group_id`);

    if (groupInfo.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    const senderUsername = senderInfo.recordset[0].username;
    const { groupname, groupcode } = groupInfo.recordset[0];

    const notificationContent = `Bạn được ${senderUsername} mời gia nhập nhóm ${groupname}-${groupcode}`;

    // Thêm yêu cầu vào bảng Grequest
    await pool.request()
      .input('sender_id', sql.Int, sender_id)
      .input('receiver_id', sql.Int, receiver_id)
      .input('group_id', sql.Int, group_id)
      .input('content', sql.NVarChar(500), content || null)
      .input('status', sql.VarChar(20), 'pending')
      .query(`
        INSERT INTO Grequest (sender_id, receiver_id, group_id, content, status)
        VALUES (@sender_id, @receiver_id, @group_id, @content, @status)
      `);

    // Tạo thông báo cho receiver
    await pool.request()
      .input('user_id', sql.Int, receiver_id)
      .input('content', sql.NVarChar(sql.MAX), notificationContent)
      .query(`
        INSERT INTO Notification (user_id, content)
        VALUES (@user_id, @content)
      `);

    res.status(200).json({ message: 'Gửi yêu cầu mời thành viên thành công' });

  } catch (err) {
    console.error('Lỗi khi gửi yêu cầu nhóm:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleRequestGroup };