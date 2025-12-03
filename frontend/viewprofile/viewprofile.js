window.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('selected_user_id');
  if (!userId) return;

  try {
    const response = await fetch('http://localhost:3000/api/viewprofile', {
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

      document.getElementById('id').textContent = user.user_id;
      document.getElementById('fullName').textContent = fullName;
      document.getElementById('email').textContent = user.email;
      document.getElementById('dob').textContent = dob;
      document.getElementById('about').textContent = user.about || 'Chưa có giới thiệu';

      const strengths = user.strengths?.split(',') || [];
      const weaknesses = user.weaknesses?.split(',') || [];

      strengths.forEach(str => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = str.trim();
        document.getElementById('strengths').appendChild(tag);
      });

      weaknesses.forEach(weak => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = weak.trim();
        document.getElementById('weaknesses').appendChild(tag);
      });

      document.getElementById('sendRequestBtn').addEventListener('click', () => {
        localStorage.setItem('receiver_id', user.user_id);
        window.location.href = '../friendform/friendform.html';
      });

      document.getElementById('sendgRequestBtn').addEventListener('click', () => {
        localStorage.setItem('receiver_id', user.user_id);
        window.location.href = '../groupform/groupform.html';
      });
    }
  } catch (err) {
    console.error('Lỗi khi tải thông tin:', err);
  }
});