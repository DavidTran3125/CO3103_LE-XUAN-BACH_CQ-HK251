const sql = require('mssql');
const config = require('./config');

function setupSocket(io) {
  io.on('connection', socket => {
    console.log(' Người dùng kết nối:', socket.id);

    // Người dùng tham gia phòng chat
    socket.on('join', ({ userId, targetId, isGroup }) => {
      const room = isGroup 
        ? `group_${targetId}` 
        : `chat_${[userId, targetId].sort((a, b) => a - b).join('_')}`;
      socket.join(room);
      console.log(` ${socket.id} đã vào phòng ${room}`);
    });

    // Gửi tin nhắn
    socket.on('sendMessage', async ({ senderId, receiverId, groupId, content }) => {
      try {
        const pool = await sql.connect(config);

        await pool.request()
          .input('sender_id', sql.Int, senderId)
          .input('receiver_id', sql.Int, receiverId || null)
          .input('group_id', sql.Int, groupId || null)
          .input('content', sql.NVarChar(500), content)
          .query(`
            INSERT INTO Message (sender_id, receiver_id, group_id, content)
            VALUES (@sender_id, @receiver_id, @group_id, @content)
          `);

        const room = groupId 
          ? `group_${groupId}` 
          : `chat_${[senderId, receiverId].sort((a, b) => a - b).join('_')}`;

        io.to(room).emit('receiveMessage', {
          senderId,
          receiverId,
          groupId,
          content,
          sentAt: new Date()
        });

        console.log(`Tin nhắn gửi đến ${room}: ${content}`);
      } catch (err) {
        console.error('Lỗi khi gửi tin nhắn:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Người dùng ngắt kết nối:', socket.id);
    });
  });
}

module.exports = { setupSocket };