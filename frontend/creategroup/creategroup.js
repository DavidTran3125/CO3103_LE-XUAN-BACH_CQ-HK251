document.getElementById('createGroupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const groupname = document.getElementById('groupname').value.trim();
  const groupcode = document.getElementById('groupcode').value.trim();
  const messageBox = document.getElementById('messageBox');

  if (!groupname || !groupcode) {
    messageBox.textContent = 'Vui lòng nhập đầy đủ thông tin.';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/creategroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ groupname, groupcode })
    });

    const data = await res.json();

    if (res.ok) {
      messageBox.textContent = ` Nhóm "${data.groupname}" đã được tạo thành công!`;
      document.getElementById('createGroupForm').reset();
      window.location.href = '../group/group.html';
    } else {
      messageBox.textContent = ` ${data.message || 'Tạo nhóm thất bại.'}`;
    }
  } catch (err) {
    console.error('Lỗi khi tạo nhóm:', err);
    messageBox.textContent = ' Có lỗi xảy ra, vui lòng thử lại sau.';
  }
});