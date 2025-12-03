const sql = require('mssql');
const config = require('../config');

// Lấy toàn bộ điểm mạnh của user
async function handleGetStrengths(req, res) {
  try {
    const userId = req.user.id;

    const pool = await sql.connect(config);

    // Truy vấn toàn bộ điểm mạnh của user
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT so.option_name, st.type_name
        FROM UserStrengths us
        JOIN StrengthOptions so ON us.option_id = so.option_id
        JOIN StrengthTypes st ON so.type_id = st.type_id
        WHERE us.user_id = @user_id
      `);

    const strengths = result.recordset;

    res.status(200).json({ strengths });
  } catch (err) {
    console.error('Lỗi khi lấy điểm mạnh:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetStrengths };