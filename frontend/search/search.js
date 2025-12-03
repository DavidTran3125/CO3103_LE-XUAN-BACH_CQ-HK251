document.getElementById('searchBtn').addEventListener('click', async () => {
  const userId = document.getElementById('userIdInput').value.trim();
  const resultBox = document.getElementById('searchResult');
  resultBox.innerHTML = '';

  localStorage.removeItem('search_results');

  if (!userId) {
    alert('Vui lòng nhập ID người dùng');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/getuser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId })
    });

    const data = await response.json();

    if (response.ok && data.user) {
      const user = data.user;

      const fullName = `${user.first_name} ${user.last_name}`;
      const dob = new Date(user.Dob).toLocaleDateString('vi-VN');

      const card = document.createElement('div');
      card.className = 'user-card';

      const info = document.createElement('div');
      info.className = 'user-info';
      info.innerHTML = `
        <p><strong>Họ tên:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Ngày sinh:</strong> ${dob}</p>
      `;

      const detailBtn = document.createElement('button');
      detailBtn.className = 'detail-btn';
      detailBtn.textContent = 'Chi tiết';
      detailBtn.onclick = () => {
        localStorage.setItem('selected_user_id', user.user_id);

        window.location.href = '../viewprofile/viewprofile.html';
      };

      card.appendChild(info);
      card.appendChild(detailBtn);
      resultBox.appendChild(card);
    } else {
      resultBox.innerHTML = `<p>Không tìm thấy người dùng với ID ${userId}</p>`;
    }
  } catch (err) {
    console.error('Lỗi khi tìm kiếm:', err);
    resultBox.innerHTML = `<p>Có lỗi xảy ra, vui lòng thử lại sau.</p>`;
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const resultBox = document.getElementById('searchResult');
  const storedResults = localStorage.getItem('search_results');

  if (storedResults) {
    const users = JSON.parse(storedResults);
    resultBox.innerHTML = '';

    if (users.length === 0) {
      resultBox.innerHTML = '<p>Không tìm thấy người dùng phù hợp.</p>';
    } else {
      users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const info = document.createElement('div');
        info.className = 'user-info';
        info.innerHTML = `
          <p><strong>Họ tên:</strong> ${user.full_name || (user.first_name + ' ' + user.last_name)}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Ngày sinh:</strong> ${new Date(user.dob).toLocaleDateString('vi-VN')}</p>
        `;

        const detailBtn = document.createElement('button');
        detailBtn.className = 'detail-btn';
        detailBtn.textContent = 'Chi tiết';
        detailBtn.onclick = () => {
          localStorage.setItem('selected_user_id', user.user_id);
          window.location.href = '../viewprofile/viewprofile.html';
        };

        card.appendChild(info);
        card.appendChild(detailBtn);
        resultBox.appendChild(card);
      });
    }

    // localStorage.removeItem('search_results');
  }
});