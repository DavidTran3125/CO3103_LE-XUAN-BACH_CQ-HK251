function showNotification(message, redirect = null) {
  const notification = document.getElementById('notification');
  const messageBox = document.getElementById('notificationMessage');
  messageBox.textContent = message;

  notification.classList.remove('hidden');
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hidden');
    if (redirect) {
      window.location.href = redirect;
    }
  }, 5000);
}

// Xử lý submit form
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = {
    username: e.target.username.value,
    first_name: e.target.first_name.value,
    last_name: e.target.last_name.value,
    email: e.target.email.value,
    Dob: e.target.Dob.value,
    password: e.target.password.value
  };

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    if (response.ok) {
      window.location.href = '../login/login.html';
    } else {
      const error = await response.json();
      showNotification('Đăng ký thất bại: ' + error.message);
    }
  } catch (err) {
    console.error(err);
    showNotification('Đã có lỗi xảy ra, vui lòng thử lại.');
  }
});