window.addEventListener('DOMContentLoaded', async () => {
  const requestId = localStorage.getItem('selected_request_id');
  if (!requestId) {
    alert('Không tìm thấy request_id');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/viewrequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ request_id: requestId })
    });

    const data = await response.json();

    if (response.ok && data.sender) {
      const sender = data.sender;

      document.getElementById('fullName').textContent = sender.full_name;
      document.getElementById('email').textContent = sender.email;
      document.getElementById('dob').textContent = new Date(sender.dob).toLocaleDateString('vi-VN');
      document.getElementById('about').textContent = sender.about || 'Chưa có giới thiệu';
      document.getElementById('sentAt').textContent = new Date(data.sent_at).toLocaleString('vi-VN');
      document.getElementById('content').textContent = data.content || '(Không có nội dung)';
    } else {
      alert(data.message || 'Không thể tải thông tin yêu cầu');
    }
  } catch (err) {
    console.error('Lỗi khi tải chi tiết yêu cầu:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
  }

  // Xử lý nút Đồng ý
  document.getElementById('acceptBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:3000/api/afrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId })
      });

      const result = await res.json();
      alert(result.message || 'Yêu cầu đã được chấp nhận');
      window.location.href = '../friendrequest/friendrequest.html';
    } catch (err) {
      console.error('Lỗi khi chấp nhận yêu cầu:', err);
      alert('Có lỗi xảy ra khi xử lý yêu cầu');
    }
  });

  // Xử lý nút Từ chối
  document.getElementById('rejectBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:3000/api/rfrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId })
      });

      const result = await res.json();
      alert(result.message || 'Yêu cầu đã bị từ chối');
      window.location.href = '../friendrequest/friendrequest.html';
    } catch (err) {
      console.error('Lỗi khi từ chối yêu cầu:', err);
      alert('Có lỗi xảy ra khi xử lý yêu cầu');
    }
  });
});