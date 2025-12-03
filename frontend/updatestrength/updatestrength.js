// Toggle chọn/bỏ chọn
document.querySelectorAll('.strength-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('selected');
  });
});

// Tự động đánh dấu các điểm mạnh đã lưu
async function loadSelectedStrengths() {
  try {
    const response = await fetch('http://localhost:3000/api/getstrengths', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    if (response.ok && Array.isArray(data.strengths)) {
      const savedStrengths = data.strengths.map(s => s.option_name.trim());

      document.querySelectorAll('.strength-item').forEach(item => {
        const itemText = item.textContent.trim();
        if (savedStrengths.includes(itemText)) {
          item.classList.add('selected');
        }
      });
    } else {
      console.warn('Không lấy được điểm mạnh:', data.message);
    }
  } catch (err) {
    console.error('Lỗi khi tải điểm mạnh:', err);
  }
}

// Gọi khi trang vừa load
window.addEventListener('DOMContentLoaded', loadSelectedStrengths);

// Lưu dữ liệu
document.getElementById('saveBtn').addEventListener('click', async () => {
  const selected = Array.from(document.querySelectorAll('.strength-item.selected'))
                        .map(item => item.textContent.trim());

  try {
    const response = await fetch('http://localhost:3000/api/updatestrengths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ strengths: selected })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Cập nhật điểm mạnh thành công!');
      window.location.href = '../profile/profile.html';
    } else {
      alert(data.message || 'Cập nhật thất bại');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }
});