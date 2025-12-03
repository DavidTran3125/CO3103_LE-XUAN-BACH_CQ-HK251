document.addEventListener('DOMContentLoaded', async () => {
  const memberList = document.getElementById('memberList');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const deleteGroupBtn = document.getElementById('deleteGroupBtn');

  const groupId = localStorage.getItem('selected_group_id');

  async function loadMembers() {
    try {
      const res = await fetch('http://localhost:3000/api/getallmember', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: parseInt(groupId) })
      });

      const data = await res.json();
      memberList.innerHTML = '';

      if (res.ok && data.members.length > 0) {
        data.members.forEach(m => {
          const card = document.createElement('div');
          card.className = 'member-card';

          const info = document.createElement('div');
          info.className = 'member-info';
          info.innerHTML = `
            <span>${m.username} (${m.role})</span>
            <small>Họ tên: ${m.first_name} ${m.last_name}</small>
            <small>Tham gia: ${new Date(m.join_at).toLocaleDateString()}</small>
          `;

          // Nút xóa thành viên
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Xóa';
          deleteBtn.className = 'danger-btn';
          deleteBtn.onclick = async () => {
            const confirmKick = confirm(`Bạn có chắc muốn xóa ${m.username} khỏi nhóm?`);
            if (!confirmKick) return;

            try {
              const resKick = await fetch('http://localhost:3000/api/kick', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_id: parseInt(groupId), member_id: m.user_id })
              });

              const result = await resKick.json();
              if (resKick.ok) {
                alert(result.message);
                await loadMembers(); // reload danh sách sau khi xóa
              } else {
                alert(result.message || 'Xóa thành viên thất bại');
              }
            } catch (err) {
              console.error('Lỗi khi xóa thành viên:', err);
              alert('Lỗi khi xóa thành viên');
            }
          };

          // Nút chi tiết
          const detailBtn = document.createElement('button');
          detailBtn.textContent = 'Chi tiết';
          detailBtn.className = 'detail-btn';
          detailBtn.onclick = () => {
            localStorage.setItem('selected_user_id', m.user_id);
            window.location.href = '../viewprofile/viewprofile.html';
          };

          const actionBox = document.createElement('div');
          actionBox.className = 'member-actions';
          actionBox.appendChild(deleteBtn);
          actionBox.appendChild(detailBtn);

          card.appendChild(info);
          card.appendChild(actionBox);
          memberList.appendChild(card);
        });

        // Nút rời nhóm cho user hiện tại
        const leaveBtn = document.createElement('button');
        leaveBtn.textContent = 'Rời nhóm';
        leaveBtn.className = 'danger-btn';
        leaveBtn.style.marginTop = '20px';

        leaveBtn.onclick = async () => {
          const confirmLeave = confirm('Bạn có chắc muốn rời khỏi nhóm này?');
          if (!confirmLeave) return;

          try {
            const res = await fetch('http://localhost:3000/api/leavemember', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ group_id: parseInt(groupId) })
            });

            const data = await res.json();
            if (res.ok) {
              alert(data.message);
              window.location.href = '../group/group.html';
            } else {
              alert(data.message || 'Rời nhóm thất bại');
            }
          } catch (err) {
            console.error('Lỗi khi rời nhóm:', err);
            alert('Lỗi khi rời nhóm');
          }
        };

        memberList.appendChild(leaveBtn);
      } else {
        memberList.innerHTML = '<p>Không có thành viên nào.</p>';
      }
    } catch (err) {
      console.error('Lỗi khi tải thành viên:', err);
      memberList.innerHTML = '<p>Lỗi khi tải danh sách.</p>';
    }
  }

  addMemberBtn.addEventListener('click', () => {
    alert('Chức năng thêm thành viên đang được phát triển...');
  });

  deleteGroupBtn.addEventListener('click', async () => {
    const confirmDelete = confirm('Bạn có chắc muốn xóa nhóm này?');
    if (!confirmDelete) return;

    try {
      const res = await fetch('http://localhost:3000/api/deletegroup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: parseInt(groupId) })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Nhóm đã được xóa');
        window.location.href = '../group/group.html';
      } else {
        alert(data.message || 'Xóa nhóm thất bại');
      }
    } catch (err) {
      console.error('Lỗi khi xóa nhóm:', err);
      alert('Lỗi khi xóa nhóm');
    }
  });

  await loadMembers();
});