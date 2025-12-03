const sql = require('mssql');
const config = require('../config');

// Lấy thông tin người dùng khác (không phải người đang đăng nhập)
async function handleViewProfile(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'Thiếu user_id cần xem' });
    }

    const pool = await sql.connect(config);

    // Truy vấn thông tin người dùng (không lấy password)
    const userResult = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT user_id, username, first_name, last_name, email, Dob, about, created_at
        FROM Users
        WHERE user_id = @user_id
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = userResult.recordset[0];

    // Truy vấn điểm mạnh
    const strengthsResult = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT o.option_name
        FROM UserStrengths us
        JOIN StrengthOptions o ON us.option_id = o.option_id
        WHERE us.user_id = @user_id
      `);

    const strengths = strengthsResult.recordset.map(row => row.option_name);
    const strengthsText = strengths.join(', ');

    // Truy vấn điểm yếu
    const weaknessResult = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT o.option_name
        FROM UserWeaknesses uw
        JOIN WeaknessOptions o ON uw.option_id = o.option_id
        WHERE uw.user_id = @user_id
      `);

    const weaknesses = weaknessResult.recordset.map(row => row.option_name);
    const weaknessesText = weaknesses.join(', ');

    // Trả về dữ liệu tổng hợp
    res.status(200).json({
      message: 'Lấy thông tin người dùng thành công',
      user: {
        ...user,
        strengths: strengthsText,
        weaknesses: weaknessesText
      }
    });

  } catch (err) {
    console.error('Lỗi khi lấy thông tin người dùng khác:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleViewProfile };