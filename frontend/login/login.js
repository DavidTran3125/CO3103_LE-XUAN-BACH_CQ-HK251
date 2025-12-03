document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Đăng nhập thành công:', result);

      // Lưu email và first_name vào localStorage
    localStorage.setItem('user_email', result.user.email);
    localStorage.setItem('user_first_name', result.user.first_name);

      // Chuyển sang trang home
      window.location.href = '../home/home.html';
    } else {
      const error = await response.json();
      alert('Đăng nhập thất bại: ' + error.message);
    }
  } catch (err) {
    console.error('Lỗi kết nối:', err);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }
});