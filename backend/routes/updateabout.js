const sql = require('mssql');
const config = require('../config');

async function handleUpdateAbout(req, res) {
  try {
    const userId = req.user.id;
    const { about } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Không xác định được người dùng' });
    }

    if (!about || about.trim() === '') {
      return res.status(400).json({ message: 'Nội dung giới thiệu không được để trống' });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('about', sql.NVarChar(sql.MAX), about)
      .input('user_id', sql.Int, userId)
      .query('UPDATE Users SET about = @about WHERE user_id = @user_id');

    console.log('Rows affected:', result.rowsAffected);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });
    }

    res.status(200).json({ message: 'Cập nhật giới thiệu thành công', about });
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleUpdateAbout };