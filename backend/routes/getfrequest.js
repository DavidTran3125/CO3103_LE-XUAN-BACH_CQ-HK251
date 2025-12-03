const sql = require('mssql');
const config = require('../config');

// Hàm dùng chung để lấy request theo trạng thái
async function getRequestsByStatus(req, res, statusLabel) {
  try {
    const currentUserId = req.user.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('user_id', sql.Int, currentUserId)
      .input('status', sql.VarChar(20), statusLabel)
      .query(`
        SELECT r.request_id, r.sender_id, r.receiver_id, r.content, r.status, r.sent_at,
               u.first_name, u.last_name, u.email, u.Dob
        FROM Request r
        JOIN Users u ON r.sender_id = u.user_id
        WHERE r.receiver_id = @user_id AND r.status = @status
        ORDER BY r.sent_at DESC
      `);

    res.status(200).json({
      message: `Lấy danh sách yêu cầu "${statusLabel}" thành công`,
      requests: result.recordset.map(r => ({
        request_id: r.request_id,
        sender_id: r.sender_id,
        sender_name: `${r.first_name} ${r.last_name}`,
        sender_email: r.email,
        sender_dob: r.Dob,
        receiver_id: r.receiver_id,
        content: r.content,
        status: r.status,
        sent_at: r.sent_at
      }))
    });
  } catch (err) {
    console.error(`Lỗi khi lấy request ${statusLabel}:`, err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

// Các hàm cụ thể cho từng trạng thái
const handleGetPendingRequests = (req, res) => getRequestsByStatus(req, res, 'pending');
const handleGetAcceptedRequests = (req, res) => getRequestsByStatus(req, res, 'accepted');
const handleGetRejectedRequests = (req, res) => getRequestsByStatus(req, res, 'rejected');

// Xuất ra để dùng trong server.js
module.exports = {
  handleGetPendingRequests,
  handleGetAcceptedRequests,
  handleGetRejectedRequests
};