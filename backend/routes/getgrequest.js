const sql = require('mssql');
const config = require('../config');

// Pending
async function handleGetPendingGroupRequests(req, res) {
  try {
    const userId = req.user.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('receiver_id', sql.Int, userId)
      .query(`
        SELECT gr.request_id, gr.sender_id, u.username AS sender_name,
               gr.group_id, g.groupname, g.groupcode,
               gr.content, gr.status, gr.sent_at
        FROM Grequest gr
        JOIN Users u ON gr.sender_id = u.user_id
        JOIN Groups g ON gr.group_id = g.group_id
        WHERE gr.receiver_id = @receiver_id AND gr.status = 'pending'
        ORDER BY gr.sent_at DESC
      `);

    res.status(200).json({ message: 'Danh sách yêu cầu nhóm đang chờ', requests: result.recordset });
  } catch (err) {
    console.error('Lỗi khi lấy yêu cầu nhóm pending:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

// Accepted
async function handleGetAcceptedGroupRequests(req, res) {
  try {
    const userId = req.user.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('receiver_id', sql.Int, userId)
      .query(`
        SELECT gr.request_id, gr.sender_id, u.username AS sender_name,
               gr.group_id, g.groupname, g.groupcode,
               gr.content, gr.status, gr.sent_at
        FROM Grequest gr
        JOIN Users u ON gr.sender_id = u.user_id
        JOIN Groups g ON gr.group_id = g.group_id
        WHERE gr.receiver_id = @receiver_id AND gr.status = 'accepted'
        ORDER BY gr.sent_at DESC
      `);

    res.status(200).json({ message: 'Danh sách yêu cầu nhóm đã được chấp nhận', requests: result.recordset });
  } catch (err) {
    console.error('Lỗi khi lấy yêu cầu nhóm accepted:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

// Rejected
async function handleGetRejectedGroupRequests(req, res) {
  try {
    const userId = req.user.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('receiver_id', sql.Int, userId)
      .query(`
        SELECT gr.request_id, gr.sender_id, u.username AS sender_name,
               gr.group_id, g.groupname, g.groupcode,
               gr.content, gr.status, gr.sent_at
        FROM Grequest gr
        JOIN Users u ON gr.sender_id = u.user_id
        JOIN Groups g ON gr.group_id = g.group_id
        WHERE gr.receiver_id = @receiver_id AND gr.status = 'rejected'
        ORDER BY gr.sent_at DESC
      `);

    res.status(200).json({ message: 'Danh sách yêu cầu nhóm đã bị từ chối', requests: result.recordset });
  } catch (err) {
    console.error('Lỗi khi lấy yêu cầu nhóm rejected:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = {
  handleGetPendingGroupRequests,
  handleGetAcceptedGroupRequests,
  handleGetRejectedGroupRequests
};