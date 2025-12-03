const sql = require('mssql');
const config = require('../config');

async function handleUpdateGroupRequest(req, res) {
  try {
    const pool = await sql.connect(config);
    const { request_id, action } = req.body; // action = 'accepted' hoặc 'rejected'
    const receiver_id = req.user.id;

    if (!request_id || !['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Thiếu request_id hoặc action không hợp lệ' });
    }

    // Lấy thông tin request (dùng parameter cho receiver_id)
    const requestInfo = await pool.request()
      .input('request_id', sql.Int, request_id)
      .input('receiver_id', sql.Int, receiver_id)
      .query(`
        SELECT gr.sender_id, gr.group_id, gr.status,
               u.username AS sender_name,
               g.groupname, g.groupcode
        FROM Grequest gr
        JOIN Users u ON gr.sender_id = u.user_id
        JOIN Groups g ON gr.group_id = g.group_id
        WHERE gr.request_id = @request_id AND gr.receiver_id = @receiver_id
      `);

    if (requestInfo.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc bạn không phải người nhận' });
    }

    const { sender_id, group_id, status, groupname, groupcode } = requestInfo.recordset[0];

    if (status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý trước đó' });
    }

    // Cập nhật trạng thái yêu cầu
    await pool.request()
      .input('request_id', sql.Int, request_id)
      .input('status', sql.VarChar(20), action)
      .query(`UPDATE Grequest SET status = @status WHERE request_id = @request_id`);

    // Nếu accept -> thêm vào Member và Permission
    if (action === 'accepted') {
      await pool.request()
        .input('group_id', sql.Int, group_id)
        .input('user_id', sql.Int, receiver_id)
        .input('role', sql.VarChar(20), 'member')
        .query(`
          INSERT INTO Member (group_id, user_id, role)
          VALUES (@group_id, @user_id, @role)
        `);

      await pool.request()
        .input('group_id', sql.Int, group_id)
        .input('user_id', sql.Int, receiver_id)
        .query(`
          INSERT INTO Permission (group_id, user_id)
          VALUES (@group_id, @user_id)
        `);
    }

    // Lấy username của receiver để tạo thông báo
    const receiverInfo = await pool.request()
      .input('user_id', sql.Int, receiver_id)
      .query(`SELECT username FROM Users WHERE user_id = @user_id`);

    const receiverUsername = receiverInfo.recordset[0].username;
    const notificationContent =
      action === 'accepted'
        ? `${receiverUsername} đã đồng ý lời mời gia nhập nhóm ${groupname}-${groupcode}`
        : `${receiverUsername} đã từ chối lời mời gia nhập nhóm ${groupname}-${groupcode}`;

    // Tạo thông báo cho sender
    await pool.request()
      .input('user_id', sql.Int, sender_id)
      .input('content', sql.NVarChar(sql.MAX), notificationContent)
      .query(`
        INSERT INTO Notification (user_id, content)
        VALUES (@user_id, @content)
      `);

    res.status(200).json({ message: `Bạn đã ${action === 'accepted' ? 'chấp nhận' : 'từ chối'} lời mời` });

  } catch (err) {
    console.error('Lỗi khi cập nhật yêu cầu nhóm:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleUpdateGroupRequest };