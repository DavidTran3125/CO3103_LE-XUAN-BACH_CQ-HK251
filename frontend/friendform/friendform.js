document.getElementById('submitRequestBtn').addEventListener('click', async () => {
  const receiverId = localStorage.getItem('receiver_id');
  const content = document.getElementById('requestContent').value.trim();

  if (!receiverId) {
    alert('Không tìm thấy người nhận');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/requestfriend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ receiver_id: receiverId, content })
    });

    const result = await res.json();
    alert(result.message || 'Yêu cầu đã được gửi');

    window.history.back();
  } catch (err) {
    console.error('Lỗi gửi yêu cầu:', err);
    alert('Có lỗi xảy ra khi gửi yêu cầu');
  }
});