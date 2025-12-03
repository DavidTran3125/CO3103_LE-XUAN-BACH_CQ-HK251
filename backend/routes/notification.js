const sql = require('mssql');
const config = require('../config');

// Lấy toàn bộ thông báo của user
async function handleGetNotifications(req, res) {
  try {
    const pool = await sql.connect(config);
    const userId = req.user.id;

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT notification_id, content
        FROM Notification
        WHERE user_id = @user_id
        ORDER BY notification_id DESC
      `);

    res.status(200).json({
      message: 'Lấy danh sách thông báo thành công',
      notifications: result.recordset
    });
  } catch (err) {
    console.error('Lỗi khi lấy thông báo:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

// Xóa một thông báo cụ thể
async function handleDeleteNotification(req, res) {
  try {
    const pool = await sql.connect(config);
    const { notification_id } = req.body;
    const userId = req.user.id;

    if (!notification_id) {
      return res.status(400).json({ message: 'Thiếu notification_id' });
    }

    // Kiểm tra thông báo có thuộc về user này không
    const check = await pool.request()
      .input('notification_id', sql.Int, notification_id)
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT notification_id FROM Notification
        WHERE notification_id = @notification_id AND user_id = @user_id
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo hoặc không thuộc về bạn' });
    }

    // Xóa thông báo
    await pool.request()
      .input('notification_id', sql.Int, notification_id)
      .query(`DELETE FROM Notification WHERE notification_id = @notification_id`);

    res.status(200).json({ message: 'Xóa thông báo thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa thông báo:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetNotifications, handleDeleteNotification };