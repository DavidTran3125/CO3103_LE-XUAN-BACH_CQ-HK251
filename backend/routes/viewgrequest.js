const sql = require('mssql');
const config = require('../config');

async function handleViewGroupRequest(req, res) {
  try {
    const pool = await sql.connect(config);
    const { request_id } = req.body;
    const receiver_id = req.user.id; // lấy từ cookie đã xác thực

    if (!request_id) {
      return res.status(400).json({ message: 'Thiếu request_id' });
    }

    // Lấy thông tin yêu cầu
    const result = await pool.request()
      .input('request_id', sql.Int, request_id)
      .input('receiver_id', sql.Int, receiver_id)
      .query(`
        SELECT gr.request_id, gr.sender_id, u.username AS sender_name,
               gr.group_id, g.groupname, g.groupcode, gr.status, gr.sent_at
        FROM Grequest gr
        JOIN Users u ON gr.sender_id = u.user_id
        JOIN Groups g ON gr.group_id = g.group_id
        WHERE gr.request_id = @request_id AND gr.receiver_id = @receiver_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc bạn không phải người nhận' });
    }

    const request = result.recordset[0];

    res.status(200).json({
      message: 'Xem chi tiết yêu cầu nhóm thành công',
      request: {
        request_id: request.request_id,
        sender_id: request.sender_id,
        sender_name: request.sender_name,
        group_id: request.group_id,
        groupname: request.groupname,
        groupcode: request.groupcode,
        status: request.status,
        sent_at: request.sent_at
      }
    });

  } catch (err) {
    console.error('Lỗi khi xem chi tiết yêu cầu nhóm:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleViewGroupRequest };