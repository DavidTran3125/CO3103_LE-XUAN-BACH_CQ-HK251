const sql = require('mssql');
const config = require('../config');

// Lấy toàn bộ điểm yếu của user
async function handleGetWeaknesses(req, res) {
  try {
    const userId = req.user.id;

    const pool = await sql.connect(config);

    // Truy vấn toàn bộ điểm yếu của user
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT wo.option_name, wt.type_name
        FROM UserWeaknesses uw
        JOIN WeaknessOptions wo ON uw.option_id = wo.option_id
        JOIN WeaknessTypes wt ON wo.type_id = wt.type_id
        WHERE uw.user_id = @user_id
      `);

    const weaknesses = result.recordset;

    res.status(200).json({ weaknesses });
  } catch (err) {
    console.error('Lỗi khi lấy điểm yếu:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleGetWeaknesses };