const socket = io('http://localhost:3000');

let currentUserId = null;
let selectedId = null;
let isGroup = false;

// Lấy userId từ cookie (giả sử backend đã gắn vào profile)
async function getCurrentUserId() {
  try {
    const res = await fetch('http://localhost:3000/api/profile', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok && data.user && data.user.user_id) {
      currentUserId = data.user.user_id;
    }
  } catch (err) {
    console.error('Không lấy được user_id:', err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await getCurrentUserId();

  const groupList = document.getElementById('groupList');
  const friendList = document.getElementById('friendList');
  const chatHeader = document.getElementById('chatHeader');
  const chatBox = document.getElementById('chatBox');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');

  // Hiển thị tên và tải lịch sử chat
  async function openChat(name, id, group = false) {
    selectedId = id;
    isGroup = group;
    chatHeader.textContent = name;
    chatBox.innerHTML = '';

    // Tham gia phòng socket
    socket.emit('join', { userId: currentUserId, targetId: selectedId, isGroup });

    // Tải lịch sử tin nhắn từ API
    try {
      const res = await fetch('http://localhost:3000/api/getmessages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: selectedId, isGroup })
      });
      const data = await res.json();

      if (res.ok && data.messages.length > 0) {
        data.messages.forEach(m => {
          const sender = m.sender_id === currentUserId ? 'Bạn' : m.sender_name;
          appendMessage(sender, m.content, m.sent_at);
        });
      } else {
        chatBox.innerHTML = '<p>Chưa có tin nhắn nào.</p>';
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử tin nhắn:', err);
      chatBox.innerHTML = '<p>Lỗi khi tải lịch sử tin nhắn.</p>';
    }
  }

  // Tải danh sách nhóm
  try {
    const resGroup = await fetch('http://localhost:3000/api/getmygroup', {
      method: 'GET',
      credentials: 'include'
    });
    const dataGroup = await resGroup.json();

    if (resGroup.ok && dataGroup.groups.length > 0) {
      dataGroup.groups.forEach(g => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.textContent = g.groupname;
        item.onclick = () => openChat(g.groupname, g.group_id, true);
        groupList.appendChild(item);
      });
    } else {
      groupList.innerHTML = '<p>Không có nhóm nào.</p>';
    }
  } catch (err) {
    console.error('Lỗi khi tải nhóm:', err);
    groupList.innerHTML = '<p>Lỗi khi tải nhóm.</p>';
  }

  // Tải danh sách bạn bè
  try {
    const resFriend = await fetch('http://localhost:3000/api/getallfriend', {
      method: 'GET',
      credentials: 'include'
    });
    const dataFriend = await resFriend.json();

    if (resFriend.ok && dataFriend.friends.length > 0) {
      dataFriend.friends.forEach(f => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.textContent = f.username;
        item.onclick = () => openChat(f.username, f.user_id, false);
        friendList.appendChild(item);
      });
    } else {
      friendList.innerHTML = '<p>Không có bạn nào.</p>';
    }
  } catch (err) {
    console.error('Lỗi khi tải bạn bè:', err);
    friendList.innerHTML = '<p>Lỗi khi tải bạn bè.</p>';
  }

  // Gửi tin nhắn
  sendBtn.addEventListener('click', () => {
    const content = messageInput.value.trim();
    if (!content || !selectedId || !currentUserId) return;

    console.log('Gửi tin nhắn:', content);

    socket.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: isGroup ? null : selectedId,
      groupId: isGroup ? selectedId : null,
      content
    });

    messageInput.value = '';
  });

  // Nhận tin nhắn realtime
  socket.on('receiveMessage', msg => {
    const sender = msg.senderId === currentUserId ? 'Bạn' : 'Đối phương';
    appendMessage(sender, msg.content, msg.sentAt);
  });

  // Hiển thị tin nhắn
 function appendMessage(sender, content, time) {
  const msg = document.createElement('div');
  msg.className = sender === 'Bạn' ? 'message me' : 'message other';
  msg.innerHTML = `<span>${sender}: ${content}</span> <small>${time ? new Date(time).toLocaleTimeString() : ''}</small>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
});