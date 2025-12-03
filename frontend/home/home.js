document.addEventListener('DOMContentLoaded', async () => {
  // Lấy first_name từ localStorage
  const firstName = localStorage.getItem('user_first_name') || 'Người dùng';
  document.getElementById('welcomeMessage').textContent = `Chào mừng trở lại, ${firstName}`;

  // Load thống kê home
  try {
    const res = await fetch('http://localhost:3000/api/home', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();

    if (res.ok && data.data) {
      document.getElementById('friendCount').textContent = data.data.friends;
      document.getElementById('groupCount').textContent = data.data.groups;
      document.getElementById('notificationCount').textContent = data.data.notifications;
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu home:', err);
  }

  // Xử lý thông báo
  const notificationIcon = document.getElementById('notificationIcon');
  const notificationPanel = document.getElementById('notificationPanel');

  notificationIcon.addEventListener('click', async () => {
    // Toggle hiển thị
    notificationPanel.classList.toggle('hidden');

    if (!notificationPanel.classList.contains('hidden')) {
      // Gọi API lấy thông báo
      try {
        const res = await fetch('http://localhost:3000/api/notifications', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();

        notificationPanel.innerHTML = '';

        if (res.ok && data.notifications.length > 0) {
          data.notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = 'notification-item';

            const content = document.createElement('p');
            content.textContent = n.content;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'Xóa';
            delBtn.onclick = async () => {
              try {
                const resDel = await fetch('http://localhost:3000/api/deletenotification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ notification_id: n.notification_id })
                });
                const result = await resDel.json();
                item.remove();
              } catch (err) {
                console.error('Lỗi khi xóa thông báo:', err);
              }
            };

            item.appendChild(content);
            item.appendChild(delBtn);
            notificationPanel.appendChild(item);
          });
        } else {
          notificationPanel.innerHTML = '<p>Không có thông báo nào.</p>';
        }
      } catch (err) {
        console.error('Lỗi khi tải thông báo:', err);
        notificationPanel.innerHTML = '<p>Lỗi khi tải thông báo.</p>';
      }
    }
  });
});