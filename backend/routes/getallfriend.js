const sql = require('mssql');
const config = require('../config');

async function handleGetAllFriends(req, res) {
  try {
    const currentUserId = req.user.id;

    const pool = await sql.connect(config);

    // Lấy danh sách bạn bè: nếu currentUserId là user1 thì bạn là user2, ngược lại
    const result = await pool.request()
      .input('user_id', sql.Int, currentUserId)
      .query(`
        SELECT u.user_id, u.username, u.email, u.Dob, u.about, u.created_at
        FROM Friend f
        JOIN Users u 
          ON (f.user1_id = @user_id AND f.user2_id = u.user_id)
          OR (f.user2_id = @user_id AND f.user1_id = u.user_id)
        ORDER BY u.username
      `);

    res.status(200).json({
      message: 'Lấy danh sách bạn bè thành công',
      friends: result.recordset.map(f => ({
        user_id: f.user_id,
        username: f.username,
        email: f.email,
        dob: f.Dob,
        about: f.about,
        created_at: f.created_at
      }))
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách bạn bè:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetAllFriends };