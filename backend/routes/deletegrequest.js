const sql = require('mssql');
const config = require('../config');

async function handleDeleteGroupRequest(req, res) {
  try {
    const pool = await sql.connect(config);
    const { request_id } = req.body;
    const user_id = req.user.id;

    if (!request_id) {
      return res.status(400).json({ message: 'Thiếu request_id' });
    }

    // Kiểm tra xem request có tồn tại và thuộc về user này không
    const checkRequest = await pool.request()
      .input('request_id', sql.Int, request_id)
      .input('receiver_id', sql.Int, user_id)
      .query(`
        SELECT status FROM Grequest
        WHERE request_id = @request_id AND receiver_id = @receiver_id
      `);

    if (checkRequest.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc bạn không phải người nhận' });
    }

    const status = checkRequest.recordset[0].status;
    if (status === 'pending') {
      return res.status(400).json({ message: 'Không thể xóa yêu cầu khi đang chờ xử lý' });
    }

    // Xóa yêu cầu
    await pool.request()
      .input('request_id', sql.Int, request_id)
      .query(`DELETE FROM Grequest WHERE request_id = @request_id`);

    res.status(200).json({ message: 'Xóa yêu cầu nhóm thành công' });

  } catch (err) {
    console.error('Lỗi khi xóa yêu cầu nhóm:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleDeleteGroupRequest };