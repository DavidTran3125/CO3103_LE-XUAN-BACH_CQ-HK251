// Toggle chọn/bỏ chọn
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('selected');
  });
});

document.getElementById('searchBtn').addEventListener('click', async () => {
  const selectedStrengths = Array.from(document.querySelectorAll('.item.strength.selected'))
                                .map(item => item.textContent.trim());
  const selectedWeaknesses = Array.from(document.querySelectorAll('.item.weakness.selected'))
                                .map(item => item.textContent.trim());

  if (selectedStrengths.length === 0 && selectedWeaknesses.length === 0) {
    alert('Vui lòng chọn ít nhất một điểm mạnh hoặc điểm yếu');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/searchuser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        strengths: selectedStrengths,
        weaknesses: selectedWeaknesses
      })
    });

    const data = await response.json();

    if (response.ok && Array.isArray(data.users)) {
      // Lưu kết quả vào localStorage
      localStorage.setItem('search_results', JSON.stringify(data.users));

      // Chuyển sang trang search.html
      window.location.href = '../search/search.html';
    } else {
      alert(data.message || 'Có lỗi xảy ra khi tìm kiếm');
    }
  } catch (err) {
    console.error('Lỗi khi tìm kiếm:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
  }
});