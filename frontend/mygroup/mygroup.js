window.addEventListener('DOMContentLoaded', async () => {
  const groupList = document.getElementById('groupList');

  try {
    const res = await fetch('http://localhost:3000/api/getmygroup', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();

    if (res.ok && data.groups.length > 0) {
      data.groups.forEach(g => {
        const card = document.createElement('div');
        card.className = 'group-card';

        const info = document.createElement('div');
        info.className = 'group-info';
        info.innerHTML = `
          <p><strong>Tên nhóm:</strong> ${g.groupname}</p>
          <p><strong>Mã nhóm:</strong> ${g.groupcode}</p>
          <p><strong>Ngày tạo:</strong> ${new Date(g.created_at).toLocaleDateString('vi-VN')}</p>
          <p><strong>Vai trò của bạn:</strong> ${g.role === 'leader' ? 'Trưởng nhóm' : 'Thành viên'}</p>
        `;

        const action = document.createElement('div');
        action.className = 'group-action';

        const detailBtn = document.createElement('button');
        detailBtn.className = 'detail-btn';
        detailBtn.textContent = 'Chi tiết';
        detailBtn.onclick = () => {
          localStorage.setItem('selected_group_id', g.group_id);
          window.location.href = '../groupdetail/groupdetail.html';
        };

        action.appendChild(detailBtn);
        card.appendChild(info);
        card.appendChild(action);
        groupList.appendChild(card);
      });
    } else {
      groupList.innerHTML = '<p>Không có nhóm nào.</p>';
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách nhóm:', err);
    groupList.innerHTML = '<p>Có lỗi xảy ra, vui lòng thử lại sau.</p>';
  }
});