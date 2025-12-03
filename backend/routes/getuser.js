const sql = require('mssql');
const config = require('../config');

async function handleGetUser(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'Thiếu user_id' });
    }

    const pool = await sql.connect(config);

    // Truy vấn dữ liệu user đúng với cấu trúc bảng
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT user_id, first_name, last_name, email, Dob, about, created_at
        FROM Users
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    const user = result.recordset[0];
    res.status(200).json({ user });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin user:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetUser };