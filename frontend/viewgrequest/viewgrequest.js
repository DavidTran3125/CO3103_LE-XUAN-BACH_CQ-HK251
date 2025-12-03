window.addEventListener('DOMContentLoaded', async () => {
  const requestId = localStorage.getItem('selected_request_id');
  if (!requestId) {
    alert('Không tìm thấy request_id');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/viewgrequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ request_id: requestId })
    });

    const data = await response.json();

    if (response.ok && data.request) {
      const req = data.request;

      document.getElementById('senderName').textContent = req.sender_name;
      document.getElementById('groupName').textContent = req.groupname;
      document.getElementById('groupCode').textContent = req.groupcode;
      document.getElementById('sentAt').textContent = new Date(req.sent_at).toLocaleString('vi-VN');
    } else {
      alert(data.message || 'Không thể tải thông tin yêu cầu nhóm');
    }
  } catch (err) {
    console.error('Lỗi khi tải chi tiết yêu cầu nhóm:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
  }

  // Xử lý nút Đồng ý
  document.getElementById('acceptBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:3000/api/updategrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId, action: 'accepted' })
      });

      const result = await res.json();
      alert(result.message || 'Yêu cầu đã được chấp nhận');
      window.location.href = '../friendrequest/friendrequest.html';
    } catch (err) {
      console.error('Lỗi khi chấp nhận yêu cầu nhóm:', err);
      alert('Có lỗi xảy ra khi xử lý yêu cầu');
    }
  });

  // Xử lý nút Từ chối
  document.getElementById('rejectBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:3000/api/updategrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId, action: 'rejected' })
      });

      const result = await res.json();
      alert(result.message || 'Yêu cầu đã bị từ chối');
      window.location.href = '../friendrequest/friendrequest.html';
    } catch (err) {
      console.error('Lỗi khi từ chối yêu cầu nhóm:', err);
      alert('Có lỗi xảy ra khi xử lý yêu cầu');
    }
  });
});