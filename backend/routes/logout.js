function handleLogout(req, res) {
  // Xóa cookie auth_token
  res.clearCookie('auth_token', {
    path: '/',
    httpOnly: true,
    sameSite: 'Strict',
    secure: false
  });

  res.status(200).json({ message: 'Đăng xuất thành công' });
}

module.exports = { handleLogout };