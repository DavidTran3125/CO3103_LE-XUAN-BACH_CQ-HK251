const sql = require('mssql');
const config = require('../config');

async function handleGetHome(req, res) {
  try {
    const pool = await sql.connect(config);
    const userId = req.user.id;

    // Đếm số nhóm user tham gia
    const groupResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT COUNT(*) AS group_count
        FROM Member
        WHERE user_id = @user_id
      `);

    // Đếm số bạn bè (user có thể là user1 hoặc user2)
    const friendResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT COUNT(*) AS friend_count
        FROM Friend
        WHERE user1_id = @user_id OR user2_id = @user_id
      `);

    // Đếm số notification của user
    const notificationResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT COUNT(*) AS notification_count
        FROM Notification
        WHERE user_id = @user_id
      `);

    res.status(200).json({
      message: 'Lấy thông tin Home thành công',
      data: {
        groups: groupResult.recordset[0].group_count,
        friends: friendResult.recordset[0].friend_count,
        notifications: notificationResult.recordset[0].notification_count
      }
    });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin Home:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetHome };