document.addEventListener('DOMContentLoaded', async () => {
  const groupList = document.getElementById('groupList');
  const receiverId = localStorage.getItem('receiver_id');

  async function loadGroups() {
    try {
      const res = await fetch('http://localhost:3000/api/getmygroup', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await res.json();
      groupList.innerHTML = '';

      if (res.ok && data.groups.length > 0) {
        data.groups.forEach(g => {
          const card = document.createElement('div');
          card.className = 'group-card';

          const info = document.createElement('div');
          info.className = 'group-info';
          info.innerHTML = `
            <span>${g.groupname}</span>
            <small>Mã nhóm: ${g.groupcode}</small>
            <small>Vai trò: ${g.role}</small>
          `;

          const inviteBtn = document.createElement('button');
          inviteBtn.textContent = 'Mời vào';
          inviteBtn.onclick = async () => {
            try {
              const resInvite = await fetch('http://localhost:3000/api/requestgroup', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  group_id: g.group_id,
                  receiver_id: parseInt(receiverId),
                  content: null
                })
              });

              const result = await resInvite.json();
              if (resInvite.ok) {
                alert(result.message || 'Đã gửi lời mời thành công!');
              } else {
                alert(result.message || 'Gửi lời mời thất bại');
              }
            } catch (err) {
              console.error('Lỗi khi gửi lời mời:', err);
              alert('Có lỗi xảy ra khi gửi lời mời');
            }
          };

          card.appendChild(info);
          card.appendChild(inviteBtn);
          groupList.appendChild(card);
        });
      } else {
        groupList.innerHTML = '<p>Bạn chưa tham gia nhóm nào.</p>';
      }
    } catch (err) {
      console.error('Lỗi khi tải nhóm:', err);
      groupList.innerHTML = '<p>Lỗi khi tải danh sách nhóm.</p>';
    }
  }

  await loadGroups();
});