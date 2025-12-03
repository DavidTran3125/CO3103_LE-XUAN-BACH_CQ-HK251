const sql = require('mssql');
const config = require('../config');

async function handleProfile(req, res) {
  try {
    const pool = await sql.connect(config);

    // Lấy dữ liệu từ bảng Users (ngoại trừ password_hash)
    const userResult = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`
        SELECT user_id, username, first_name, last_name, email, Dob, about, created_at
        FROM Users
        WHERE user_id = @user_id
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = userResult.recordset[0];

    // Lấy strengths (join UserStrengths -> StrengthOptions)
    const strengthsResult = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`
        SELECT o.option_name
        FROM UserStrengths us
        JOIN StrengthOptions o ON us.option_id = o.option_id
        WHERE us.user_id = @user_id
      `);

    const strengths = strengthsResult.recordset.map(row => row.option_name);
    const strengthsText = strengths.join(', ');

    // Lấy weaknesses (join UserWeaknesses -> WeaknessOptions)
    const weaknessResult = await pool.request()
      .input('user_id', sql.Int, req.user.id)
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
      message: 'Lấy profile thành công',
      user: {
        ...user,
        strengths: strengthsText,
        weaknesses: weaknessesText
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleProfile };