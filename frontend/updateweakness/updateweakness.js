// Toggle chọn/bỏ chọn
document.querySelectorAll('.weakness-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('selected');
  });
});

// Tự động đánh dấu các điểm yếu đã lưu
async function loadSelectedWeaknesses() {
  try {
    const response = await fetch('http://localhost:3000/api/getweaknesses', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    if (response.ok && Array.isArray(data.weaknesses)) {
      const savedWeaknesses = data.weaknesses.map(w => w.option_name.trim());

      document.querySelectorAll('.weakness-item').forEach(item => {
        const itemText = item.textContent.trim();
        if (savedWeaknesses.includes(itemText)) {
          item.classList.add('selected');
        }
      });
    } else {
      console.warn('Không lấy được điểm yếu:', data.message);
    }
  } catch (err) {
    console.error('Lỗi khi tải điểm yếu:', err);
  }
}

// Gọi khi trang vừa load
window.addEventListener('DOMContentLoaded', loadSelectedWeaknesses);

// Lưu dữ liệu
document.getElementById('saveBtn').addEventListener('click', async () => {
  const selected = Array.from(document.querySelectorAll('.weakness-item.selected'))
                        .map(item => item.textContent.trim());

  try {
    const response = await fetch('http://localhost:3000/api/updateweakness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ weaknesses: selected })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Cập nhật điểm yếu thành công!');
      window.location.href = '../profile/profile.html';
    } else {
      alert(data.message || 'Cập nhật thất bại');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }
});