document.getElementById('updateForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const aboutText = document.getElementById('aboutInput').value;

  try {
    const response = await fetch('http://localhost:3000/api/updateabout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ about: aboutText })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Cập nhật giới thiệu thành công!');
      window.location.href = '../profile/profile.html';
    } else {
      alert(data.message || 'Cập nhật thất bại');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }
});

// Nút hủy để quay lại profile
document.getElementById('cancelBtn').addEventListener('click', () => {
  window.location.href = '../profile/profile.html';
});