const requestList = document.getElementById('requestList');
const tabs = {
  pending: document.getElementById('pendingBtn'),
  accepted: document.getElementById('acceptedBtn'),
  rejected: document.getElementById('rejectedBtn')
};

function setActiveTab(tabName) {
  Object.entries(tabs).forEach(([key, btn]) => {
    btn.classList.toggle('active', key === tabName);
  });
}

async function fetchRequests(status) {
  let endpoints = [];
  if (status === 'pending') {
    endpoints = ['/api/getpfrequest', '/api/getpgrequest'];
  }
  if (status === 'accepted') {
    endpoints = ['/api/getafrequest', '/api/getagrequest'];
  }
  if (status === 'rejected') {
    endpoints = ['/api/getrfrequest', '/api/getrgrequest'];
  }

  try {
    // gọi song song cả friend và group request
    const results = await Promise.all(
      endpoints.map(ep =>
        fetch(`http://localhost:3000${ep}`, {
          method: 'GET',
          credentials: 'include'
        }).then(res => res.json())
      )
    );

    // gộp kết quả
    const allRequests = results.flatMap(r => r.requests || []);
    renderRequests(allRequests, status);
  } catch (err) {
    console.error('Lỗi khi tải request:', err);
    requestList.innerHTML = '<p>Có lỗi xảy ra, vui lòng thử lại sau.</p>';
  }
}

function renderRequests(requests, status) {
  requestList.innerHTML = '';

  if (requests.length === 0) {
    requestList.innerHTML = '<p>Không có yêu cầu nào.</p>';
    return;
  }

  requests.forEach(r => {
    const card = document.createElement('div');
    card.className = 'request-card';
    card.style.animation = 'slideUp 0.5s ease-out';

    const info = document.createElement('div');
    info.className = 'request-info';

    // Nếu có group_id thì là group request
    if (r.group_id) {
      info.innerHTML = `
        <p><strong>Người gửi:</strong> ${r.sender_name}</p>
        <p><strong>Nhóm:</strong> ${r.groupname} - ${r.groupcode}</p>
        <p><strong>Nội dung:</strong> ${r.content || '(Không có)'}</p>
        <p><strong>Ngày gửi:</strong> ${new Date(r.sent_at).toLocaleDateString('vi-VN')}</p>
      `;
    } else {
      // friend request
      info.innerHTML = `
        <p><strong>Họ tên:</strong> ${r.sender_name}</p>
        <p><strong>Email:</strong> ${r.sender_email}</p>
        <p><strong>Ngày sinh:</strong> ${new Date(r.sender_dob).toLocaleDateString('vi-VN')}</p>
      `;
    }

    const action = document.createElement('div');
    action.className = 'request-action';

    const btn = document.createElement('button');
    if (status === 'pending') {
      btn.className = 'detail-btn';
      btn.textContent = 'Xem chi tiết';
      btn.onclick = () => {
        localStorage.setItem('selected_request_id', r.request_id);
        // nếu là group request thì chuyển sang viewgrequest
        if (r.group_id) {
          window.location.href = '../viewgrequest/viewgrequest.html';
        } else {
          window.location.href = '../viewrequest/viewrequest.html';
        }
      };
    } else {
      btn.className = 'delete-btn';
      btn.textContent = 'Xóa';
      btn.onclick = async () => {
        const confirmDelete = confirm(`Bạn có chắc muốn xóa yêu cầu #${r.request_id}?`);
        if (!confirmDelete) return;

        try {
          // chọn endpoint phù hợp
          const endpoint = r.group_id ? '/api/deletegrequest' : '/api/deletefrequest';

          const res = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ request_id: r.request_id })
          });

          const result = await res.json();
          alert(result.message || 'Yêu cầu đã được xóa');
          fetchRequests(status); // reload lại danh sách
        } catch (err) {
          console.error('Lỗi khi xóa yêu cầu:', err);
          alert('Có lỗi xảy ra khi xóa yêu cầu');
        }
      };
    }

    action.appendChild(btn);
    card.appendChild(info);
    card.appendChild(action);
    requestList.appendChild(card);
  });
}

// Gắn sự kiện cho tab
tabs.pending.addEventListener('click', () => {
  setActiveTab('pending');
  fetchRequests('pending');
});

tabs.accepted.addEventListener('click', () => {
  setActiveTab('accepted');
  fetchRequests('accepted');
});

tabs.rejected.addEventListener('click', () => {
  setActiveTab('rejected');
  fetchRequests('rejected');
});

// mặc định load pending
setActiveTab('pending');
fetchRequests('pending');