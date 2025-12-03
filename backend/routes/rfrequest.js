const sql = require('mssql');
const config = require('../config');

async function handleRejectRequest(req, res) {
  try {
    const currentUserId = req.user.id;
    const { request_id } = req.body;

    if (!request_id) {
      return res.status(400).json({ message: 'Thiếu request_id' });
    }

    const pool = await sql.connect(config);

    // Lấy thông tin request + sender_id + receiver_username
    const result = await pool.request()
      .input('request_id', sql.Int, request_id)
      .input('receiver_id', sql.Int, currentUserId)
      .query(`
        SELECT r.sender_id, u.username AS receiver_username
        FROM Request r
        JOIN Users u ON r.receiver_id = u.user_id
        WHERE r.request_id = @request_id 
          AND r.receiver_id = @receiver_id 
          AND r.status = 'pending'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại hoặc đã xử lý' });
    }

    const senderId = result.recordset[0].sender_id;
    const receiverUsername = result.recordset[0].receiver_username;

    // Cập nhật trạng thái
    await pool.request()
      .input('request_id', sql.Int, request_id)
      .query(`UPDATE Request SET status = 'rejected' WHERE request_id = @request_id`);

    // Tạo notification cho sender
    const notificationContent = `${receiverUsername} đã từ chối yêu cầu kết bạn của bạn`;

    await pool.request()
      .input('user_id', sql.Int, senderId)
      .input('content', sql.NVarChar(sql.MAX), notificationContent)
      .query(`
        INSERT INTO Notification (user_id, content)
        VALUES (@user_id, @content)
      `);

    res.status(200).json({ message: 'Yêu cầu đã bị từ chối và thông báo đã được gửi' });
  } catch (err) {
    console.error('Lỗi khi từ chối yêu cầu:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleRejectRequest };