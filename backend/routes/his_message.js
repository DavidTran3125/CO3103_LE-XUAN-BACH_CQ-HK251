const sql = require('mssql');
const config = require('../config');

async function handleGetMessageHistory(req, res) {
  try {
    const pool = await sql.connect(config);
    const { targetId, isGroup } = req.body;
    const userId = req.user.id;

    if (!targetId || typeof isGroup !== 'boolean') {
      return res.status(400).json({ message: 'Thiếu targetId hoặc isGroup' });
    }

    let query;
    if (isGroup) {
      // Lịch sử tin nhắn nhóm
      query = `
        SELECT m.message_id, m.sender_id, u.username AS sender_name, m.content, m.sent_at
        FROM Message m
        JOIN Users u ON m.sender_id = u.user_id
        WHERE m.group_id = @targetId
        ORDER BY m.sent_at ASC
      `;
    } else {
      // Lịch sử tin nhắn cá nhân
      query = `
        SELECT m.message_id, m.sender_id, u.username AS sender_name, m.content, m.sent_at
        FROM Message m
        JOIN Users u ON m.sender_id = u.user_id
        WHERE (m.sender_id = @userId AND m.receiver_id = @targetId)
           OR (m.sender_id = @targetId AND m.receiver_id = @userId)
        ORDER BY m.sent_at ASC
      `;
    }

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('targetId', sql.Int, targetId)
      .query(query);

    res.status(200).json({
      message: 'Lấy lịch sử tin nhắn thành công',
      messages: result.recordset
    });

  } catch (err) {
    console.error('Lỗi khi lấy lịch sử tin nhắn:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleGetMessageHistory };