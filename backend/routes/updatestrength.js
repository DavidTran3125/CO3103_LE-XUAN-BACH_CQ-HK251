const sql = require('mssql');
const config = require('../config');

// Xử lý cập nhật điểm mạnh
async function handleUpdateStrengths(req, res) {
  try {
    const userId = req.user.id;
    const { strengths } = req.body;

    if (!strengths || strengths.length === 0) {
      return res.status(400).json({ message: 'Chưa chọn điểm mạnh' });
    }

    const pool = await sql.connect(config);

    // Xóa điểm mạnh cũ
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM UserStrengths WHERE user_id = @user_id');

    // Thêm điểm mạnh mới
    for (const s of strengths) {
      // Lấy option_id từ StrengthOptions theo option_name
      const optionResult = await pool.request()
        .input('option_name', sql.NVarChar(50), s)
        .query('SELECT option_id FROM StrengthOptions WHERE option_name = @option_name');

      if (optionResult.recordset.length > 0) {
        const optionId = optionResult.recordset[0].option_id;

        await pool.request()
          .input('user_id', sql.Int, userId)
          .input('option_id', sql.Int, optionId)
          .query('INSERT INTO UserStrengths (user_id, option_id) VALUES (@user_id, @option_id)');
      }
    }

    res.status(200).json({ message: 'Cập nhật điểm mạnh thành công', strengths });
  } catch (err) {
    console.error('Lỗi cập nhật Strengths:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleUpdateStrengths };