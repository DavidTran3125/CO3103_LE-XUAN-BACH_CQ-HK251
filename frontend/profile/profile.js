window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/profile', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Không thể lấy dữ liệu người dùng');
    }

    const data = await response.json();
    const user = data.user;

    document.getElementById('fullName').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('email').textContent = user.email;
    document.getElementById('id').textContent = user.user_id;
    document.getElementById('dob').textContent = new Date(user.Dob).toLocaleDateString('vi-VN');
    document.getElementById('strengths').textContent = user.strengths && user.strengths.length > 0 ? user.strengths : 'Chưa có thông tin';
    document.getElementById('weaknesses').textContent = user.weaknesses && user.weaknesses.length > 0 ? user.weaknesses : 'Chưa có thông tin';
    document.getElementById('about').textContent = user.about || 'Chưa có thông tin';
  } catch (err) {
    console.error('Lỗi khi tải profile:', err);
    alert('Không thể tải hồ sơ. Vui lòng thử lại.');
  }
});