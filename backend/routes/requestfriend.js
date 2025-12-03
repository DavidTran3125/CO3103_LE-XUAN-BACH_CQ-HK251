const sql = require('mssql');
const config = require('../config');

async function handleRequestFriend(req, res) {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id) {
      return res.status(400).json({ message: 'Thiếu receiver_id' });
    }

    const pool = await sql.connect(config);

    // Lấy username của sender
    const senderResult = await pool.request()
      .input('sender_id', sql.Int, senderId)
      .query(`SELECT username FROM Users WHERE user_id = @sender_id`);

    if (senderResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người gửi' });
    }

    const senderUsername = senderResult.recordset[0].username;

    // Thêm request mới
    const result = await pool.request()
      .input('sender_id', sql.Int, senderId)
      .input('receiver_id', sql.Int, receiver_id)
      .input('content', sql.NVarChar(500), content || null)
      .input('status', sql.VarChar(20), 'pending')
      .query(`
        INSERT INTO Request (sender_id, receiver_id, content, status)
        VALUES (@sender_id, @receiver_id, @content, @status);

        SELECT SCOPE_IDENTITY() AS request_id;
      `);

    const requestId = result.recordset[0].request_id;

    // Tạo notification cho receiver
    const notificationContent = `${senderUsername} đã gửi lời mời kết bạn`;

    await pool.request()
      .input('user_id', sql.Int, receiver_id)
      .input('content', sql.NVarChar(sql.MAX), notificationContent)
      .query(`
        INSERT INTO Notification (user_id, content)
        VALUES (@user_id, @content)
      `);

    res.status(201).json({
      message: 'Yêu cầu kết bạn đã được gửi và thông báo đã tạo',
      request_id: requestId,
      sender_id: senderId,
      receiver_id,
      status: 'pending'
    });
  } catch (err) {
    console.error('Lỗi khi tạo request:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleRequestFriend };