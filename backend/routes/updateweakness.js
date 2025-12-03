const sql = require('mssql');
const config = require('../config');

// Xử lý cập nhật điểm yếu
async function handleUpdateWeakness(req, res) {
  try {
    const userId = req.user.id;
    const { weaknesses } = req.body;

    if (!weaknesses || weaknesses.length === 0) {
      return res.status(400).json({ message: 'Chưa chọn điểm yếu' });
    }

    const pool = await sql.connect(config);

    // Xóa điểm yếu cũ
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM UserWeaknesses WHERE user_id = @user_id');

    // Thêm điểm yếu mới
    for (const w of weaknesses) {
      // Lấy option_id từ WeaknessOptions theo option_name
      const optionResult = await pool.request()
        .input('option_name', sql.NVarChar(50), w)
        .query('SELECT option_id FROM WeaknessOptions WHERE option_name = @option_name');

      if (optionResult.recordset.length > 0) {
        const optionId = optionResult.recordset[0].option_id;

        await pool.request()
          .input('user_id', sql.Int, userId)
          .input('option_id', sql.Int, optionId)
          .query('INSERT INTO UserWeaknesses (user_id, option_id) VALUES (@user_id, @option_id)');
      }
    }

    res.status(200).json({ message: 'Cập nhật điểm yếu thành công', weaknesses });
  } catch (err) {
    console.error('Lỗi cập nhật Weakness:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleUpdateWeakness };