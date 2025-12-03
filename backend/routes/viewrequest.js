const sql = require('mssql');
const config = require('../config');

async function handleViewRequest(req, res) {
  try {
    const currentUserId = req.user.id;
    const { request_id } = req.body;

    if (!request_id) {
      return res.status(400).json({ message: 'Thiếu request_id' });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('request_id', sql.Int, request_id)
      .input('receiver_id', sql.Int, currentUserId)
      .query(`
        SELECT r.request_id, r.content, r.sent_at,
               u.user_id AS sender_id, u.first_name, u.last_name, u.email, u.Dob, u.about, u.created_at
        FROM Request r
        JOIN Users u ON r.sender_id = u.user_id
        WHERE r.request_id = @request_id AND r.receiver_id = @receiver_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc bạn không có quyền truy cập' });
    }

    const r = result.recordset[0];

    res.status(200).json({
      request_id: r.request_id,
      content: r.content,
      sent_at: r.sent_at,
      sender: {
        user_id: r.sender_id,
        full_name: `${r.first_name} ${r.last_name}`,
        email: r.email,
        dob: r.Dob,
        about: r.about,
        created_at: r.created_at
      }
    });
  } catch (err) {
    console.error('Lỗi khi xem yêu cầu:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleViewRequest };