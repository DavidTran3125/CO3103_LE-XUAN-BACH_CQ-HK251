const sql = require('mssql');
const config = require('../config');

async function handleDeleteRequest(req, res) {
  try {
    const currentUserId = req.user.id;
    const { request_id } = req.body;

    if (!request_id) {
      return res.status(400).json({ message: 'Thiếu request_id' });
    }

    const pool = await sql.connect(config);

    // Kiểm tra quyền xóa: chỉ người nhận hoặc người gửi mới được xóa
    const check = await pool.request()
      .input('request_id', sql.Int, request_id)
      .query(`
        SELECT sender_id, receiver_id FROM Request WHERE request_id = @request_id
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
    }

    const { sender_id, receiver_id } = check.recordset[0];
    if (currentUserId !== sender_id && currentUserId !== receiver_id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa yêu cầu này' });
    }

    // Xóa yêu cầu
    await pool.request()
      .input('request_id', sql.Int, request_id)
      .query(`DELETE FROM Request WHERE request_id = @request_id`);

    res.status(200).json({ message: 'Yêu cầu đã được xóa thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa yêu cầu:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleDeleteRequest };